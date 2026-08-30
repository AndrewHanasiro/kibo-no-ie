import 'package:flutter/material.dart';
import 'models/product.dart';
import 'services/api_service.dart';

class Market extends StatefulWidget {
  const Market({super.key});

  @override
  State<Market> createState() => _MarketState();
}

class _MarketState extends State<Market> {
  // State variables
  late Future<List<Product>> _productList;
  List<Product> _allProducts = [];
  double _totalValue = 0.0;
  String _selectedCategory = 'Todos';
  List<String> _categories = [];

  @override
  void initState() {
    super.initState();
    _productList = _fetchProducts();
  }

  Future<List<Product>> _fetchProducts() async {
    final products = await ApiService.getProducts();
    if (mounted) {
      setState(() {
        _allProducts = products;
        _categories =
            ['Todos'] + products.map((p) => p.category).toSet().toList();
      });
    }
    return products;
  }

  void _updateTotal(Product product, bool isAdding) {
    setState(() {
      if (isAdding) {
        _totalValue += product.price;
        product.quantity++;
      } else if (product.quantity > 0) {
        _totalValue -= product.price;
        product.quantity--;
      }

      _totalValue = double.parse(_totalValue.toStringAsFixed(2));
    });
  }

  int get _totalItemsCount {
    return _allProducts.fold(0, (sum, item) => sum + item.quantity);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F8F2),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E4D2B),
        elevation: 0,
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFF8CB83E),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.park, color: Color(0xFF13301A), size: 18),
            ),
            const SizedBox(width: 8),
            const Text(
              '46ª Festa do Verde',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(24),
          child: Container(
            padding: const EdgeInsets.only(bottom: 8),
            child: const Text(
              'Cardápio de Comidas & Bebidas',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: Color(0xFFC5E1B8),
              ),
            ),
          ),
        ),
      ),
      body: FutureBuilder<List<Product>>(
        future: _productList,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Color(0xFF8CB83E),
                    ),
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Carregando delícias do evento...',
                    style: TextStyle(
                      color: Color(0xFF566755),
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            );
          } else if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.wifi_off,
                      size: 48,
                      color: Color(0xFFD32F2F),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Erro ao carregar cardápio: ${snapshot.error}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Color(0xFF566755),
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() {
                          _productList = _fetchProducts();
                        });
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E4D2B),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: const Icon(Icons.refresh, size: 18),
                      label: const Text('Tentar Novamente'),
                    ),
                  ],
                ),
              ),
            );
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
              child: Text(
                'Nenhum produto cadastrado no momento.',
                style: TextStyle(color: Color(0xFF566755), fontSize: 14),
              ),
            );
          }

          final displayedProducts = _selectedCategory == 'Todos'
              ? _allProducts
              : _allProducts
                    .where((p) => p.category == _selectedCategory)
                    .toList();

          return Column(
            children: [
              // Horizontal Category Chips
              if (_categories.isNotEmpty)
                Container(
                  height: 56,
                  padding: const EdgeInsets.symmetric(
                    vertical: 8.0,
                    horizontal: 8.0,
                  ),
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final category = _categories[index];
                      final isSelected = _selectedCategory == category;
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                        child: ChoiceChip(
                          showCheckmark: false,
                          label: Text(
                            category,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isSelected
                                  ? FontWeight.bold
                                  : FontWeight.w600,
                              color: isSelected
                                  ? const Color(0xFF13301A)
                                  : const Color(0xFF566755),
                            ),
                          ),
                          selected: isSelected,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() {
                                _selectedCategory = category;
                              });
                            }
                          },
                          selectedColor: const Color(0xFF8CB83E),
                          backgroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                            side: BorderSide(
                              color: isSelected
                                  ? const Color(0xFF8CB83E)
                                  : const Color(0xFFE1EBE0),
                              width: 1,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

              // Product List
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 4,
                  ),
                  itemCount: displayedProducts.length,
                  itemBuilder: (context, index) {
                    final product = displayedProducts[index];
                    return ProductItemTile(
                      product: product,
                      onAdd: () => _updateTotal(product, true),
                      onRemove: () => _updateTotal(product, false),
                    );
                  },
                ),
              ),

              // Modern Bottom Checkout Bar
              Container(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: const Border(
                    top: BorderSide(color: Color(0xFFE1EBE0), width: 1),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -4),
                    ),
                  ],
                ),
                child: SafeArea(
                  top: false,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 14,
                    ),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1E4D2B), Color(0xFF2E6B3E)],
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF1E4D2B).withValues(alpha: 0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF8CB83E),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.receipt_long,
                                color: Color(0xFF13301A),
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text(
                                  'Pedir no caixa:',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                    color: Color(0xFFC5E1B8),
                                  ),
                                ),
                                Text(
                                  '$_totalItemsCount ${_totalItemsCount == 1 ? 'item' : 'itens'} selecionados',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    color: Colors.white70,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Text(
                          'R\$ ${_totalValue.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

// --- Product List Item Widget ---
class ProductItemTile extends StatelessWidget {
  final Product product;
  final VoidCallback onAdd;
  final VoidCallback onRemove;

  const ProductItemTile({
    super.key,
    required this.product,
    required this.onAdd,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final bool isAvailable = product.isAvailable;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: product.quantity > 0
              ? const Color(0xFF8CB83E)
              : const Color(0xFFE1EBE0),
          width: product.quantity > 0 ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            // Product Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: isAvailable
                          ? const Color(0xFF1B261D)
                          : Colors.grey.shade500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF7E1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          product.category,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1E4D2B),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'R\$ ${product.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF1E4D2B),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Stepper Quantity Controls
            if (isAvailable)
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF5F8F2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFE1EBE0)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Remove Button
                    InkWell(
                      onTap: product.quantity > 0 ? onRemove : null,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(12),
                        bottomLeft: Radius.circular(12),
                      ),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        child: Icon(
                          Icons.remove,
                          size: 18,
                          color: product.quantity > 0
                              ? const Color(0xFFD32F2F)
                              : Colors.grey.shade400,
                        ),
                      ),
                    ),

                    // Quantity Counter
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      child: Text(
                        '${product.quantity}',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w800,
                          color: product.quantity > 0
                              ? const Color(0xFF1E4D2B)
                              : const Color(0xFF566755),
                        ),
                      ),
                    ),

                    // Add Button
                    InkWell(
                      onTap: onAdd,
                      borderRadius: const BorderRadius.only(
                        topRight: Radius.circular(12),
                        bottomRight: Radius.circular(12),
                      ),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF8CB83E).withValues(alpha: 0.3),
                          borderRadius: const BorderRadius.only(
                            topRight: Radius.circular(12),
                            bottomRight: Radius.circular(12),
                          ),
                        ),
                        child: const Icon(
                          Icons.add,
                          size: 18,
                          color: Color(0xFF1E4D2B),
                        ),
                      ),
                    ),
                  ],
                ),
              )
            else
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Esgotado',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade600,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
