import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'models/product.dart'; // Import the model we created

const String mockApiUrl = 'https://listproducts-veumhwpskq-uc.a.run.app';

class Market extends StatefulWidget {
  const Market({super.key});

  @override
  State<Market> createState() => _MarketState();
}

class _MarketState extends State<Market> {
  // State variables
  late Future<List<Product>> _productList;
  List<Product> _allProducts = []; // To store all fetched products
  double _totalValue = 0.0;
  String _selectedCategory = 'All'; // Default to 'All'
  List<String> _categories = [];

  @override
  void initState() {
    super.initState();
    _productList = _fetchProducts(); // This future will populate _allProducts and _categories
  }

  Future<List<Product>> _fetchProducts() async {
    final response = await http.get(Uri.parse(mockApiUrl)); //

    if (response.statusCode == 200) {
      final List<dynamic> jsonList = jsonDecode(response.body);
      final products = jsonList.map((json) => Product.fromJson(json)).toList(); //
      if (mounted) {
        setState(() {
          _allProducts = products;
          _categories = ['All'] + products.map((p) => p.category).toSet().toList();
        });
      }
      return products;
    } else {
      throw Exception('Failed to load products');
    }
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

      // Ensure total doesn't go below zero and is rounded for display
      _totalValue = double.parse(_totalValue.toStringAsFixed(2));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Comidas & Bebidas'),
        backgroundColor: Colors.blueGrey,
      ),
      body: FutureBuilder<List<Product>>(
        future: _productList,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Erro: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('Nenhum produto encontrado'));
          }

          // Use _allProducts which is populated in _fetchProducts and filter it here
          final displayedProducts = _selectedCategory == 'All'
              ? _allProducts
              : _allProducts.where((p) => p.category == _selectedCategory).toList();

          return Column(
            children: [
              // Horizontal Category Bar
              if (_categories.isNotEmpty)
                Container(
                  height: 50,
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final category = _categories[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4.0),
                        child: ChoiceChip(
                          label: Text(category),
                          selected: _selectedCategory == category,
                          onSelected: (selected) {
                            if (selected) {
                              setState(() {
                                _selectedCategory = category;
                              });
                            }
                          },
                          selectedColor: Colors.blueGrey.shade700,
                          labelStyle: TextStyle(
                            color: _selectedCategory == category ? Colors.white : Colors.black,
                          ),
                          backgroundColor: Colors.blueGrey.shade100,
                        ),
                      );
                    },
                  ),
                ),
              Expanded(
                child: ListView.builder(
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

              Container(
                padding: const EdgeInsets.all(16.0),
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.blueGrey,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(15),
                    topRight: Radius.circular(15),
                  ),
                ),
                child: Text(
                  'Pedir no caixa: \$${_totalValue.toStringAsFixed(2)}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                  textAlign: TextAlign.center,
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
    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      child: Padding(
        padding: const EdgeInsets.all(10.0),
        child: Row(
          children: [
            // Product Name and Value
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'Preço: R\$${product.price.toStringAsFixed(2)}',
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),

            // Quantity Indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Text(
                '${product.quantity}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.blueGrey,
                ),
              ),
            ),

            // Remove Button
            IconButton(
              icon: const Icon(Icons.remove_circle_outline, color: Colors.red),
              onPressed: product.quantity > 0
                  ? onRemove
                  : null, // Disable if quantity is 0
            ),

            // Add Button
            IconButton(
              icon: const Icon(Icons.add_circle_outline, color: Colors.green),
              onPressed: onAdd,
            ),
          ],
        ),
      ),
    );
  }
}
