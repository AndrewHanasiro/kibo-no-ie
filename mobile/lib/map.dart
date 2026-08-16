import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:kibo_no_ie/models/shop.dart';
import 'package:kibo_no_ie/models/product.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:geolocator/geolocator.dart';

final String shopApiUrl = dotenv.env['API_URL'] != null ? '${dotenv.env['API_URL']}/listShop' :'https://listshop-veumhwpskq-uc.a.run.app';
final String productApiUrl = dotenv.env['API_URL'] != null ? '${dotenv.env['API_URL']}/listProducts' : 'https://listproducts-veumhwpskq-uc.a.run.app';

class Map extends StatefulWidget {
  const Map({super.key});

  @override
  State<Map> createState() => MapState();
}


class MapState extends State<Map> {
  final Completer<GoogleMapController> _controller =
      Completer<GoogleMapController>();

  static const CameraPosition _initPosition = CameraPosition(
    bearing: 0,
    target: LatLng(-23.435119625012014, -46.35803342659766),
    tilt: 0,
    zoom: 18.5,
  );

  Set<Marker> _markers = {};
  List<Shop> _shops = [];
  List<Product> _products = [];
  bool _isLoading = true;
  String? _selectedShopId;
  bool _locationPermissionGranted = false;

  @override
  void initState() {
    super.initState();
    _fetchShops();
    _fetchProducts();
    _requestLocationPermission();
  }

  Future<void> _requestLocationPermission() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return;
    }

    if (mounted) {
      setState(() {
        _locationPermissionGranted = true;
      });
    }
  }

  void _updateMarkers() {
    _markers = _shops.map((shop) {
      final isSelected = _selectedShopId == null || shop.id == _selectedShopId;
      final isHighlighted = shop.id == _selectedShopId;
      
      return Marker(
        markerId: MarkerId(shop.id),
        position: LatLng(shop.latitude, shop.longitude),
        alpha: isSelected ? 1.0 : 0.4, // Faded for unselected
        icon: isHighlighted
            ? BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen)
            : BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        infoWindow: InfoWindow(
          title: shop.name,
          snippet: 'Toque para ver a barraca',
          onTap: () => _showShopDetails(shop),
        ),
        onTap: () {
          setState(() {
            _selectedShopId = shop.id;
            _updateMarkers();
          });
          _showShopDetails(shop);
        },
      );
    }).toSet();
  }

  Future<void> _fetchProducts() async {
    try {
      final response = await http.get(Uri.parse(productApiUrl));
      if (response.statusCode == 200) {
        final List<dynamic> jsonList = jsonDecode(response.body);
        if (mounted) {
          setState(() {
            _products = jsonList.map((json) => Product.fromJson(json)).toList();
          });
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  Future<void> _fetchShops() async {
    
    try {
      final response = await http.get(Uri.parse(shopApiUrl));

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = jsonDecode(response.body);
        final fetchedShops = jsonList.map((json) => Shop.fromJson(json)).toList();

        if (mounted) {
          setState(() {
            _shops = fetchedShops;
            _isLoading = false;
            _updateMarkers();
          });
        }
      } else {
        if (mounted) setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showShopDetails(Shop shop) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Header badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF7E1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.storefront, color: Color(0xFF1E4D2B), size: 14),
                      SizedBox(width: 4),
                      Text(
                        'Ponto Oficial da Festa',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1E4D2B),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Shop Name
                Text(
                  shop.name,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1B261D),
                  ),
                ),
                const SizedBox(height: 14),

                // Shop Image
                if (shop.image.isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFFE1EBE0)),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Image.network(
                        shop.image,
                        width: double.infinity,
                        height: 160,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Container(
                          height: 120,
                          color: const Color(0xFFF5F8F2),
                          child: const Center(
                            child: Icon(Icons.storefront, size: 40, color: Color(0xFF8CB83E)),
                          ),
                        ),
                      ),
                    ),
                  )
                else
                  Container(
                    height: 100,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F8F2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Center(
                      child: Icon(Icons.storefront, size: 40, color: Color(0xFF8CB83E)),
                    ),
                  ),
                const SizedBox(height: 12),

                // Coordinates Tag
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF5F8F2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Local: ${shop.latitude.toStringAsFixed(4)}, ${shop.longitude.toStringAsFixed(4)}',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF566755),
                    ),
                  ),
                ),
                const SizedBox(height: 18),

                // Close Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E4D2B),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Fechar',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _onProductSelected(Product product) async {
    if (product.shopId != null && product.shopId!.isNotEmpty) {
      try {
        final shop = _shops.firstWhere((s) => s.id == product.shopId);
        
        FocusScope.of(context).unfocus();

        setState(() {
          _selectedShopId = shop.id;
          _updateMarkers();
        });

        Future.delayed(const Duration(milliseconds: 250), () async {
          final GoogleMapController controller = await _controller.future;
          
          controller.animateCamera(
            CameraUpdate.newCameraPosition(
              CameraPosition(
                target: LatLng(shop.latitude, shop.longitude),
                zoom: 19.5,
              ),
            ),
          );
        });

        _showShopDetails(shop);
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Barraca não encontrada para este produto.')),
          );
        }
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Este produto não está associado a nenhuma barraca.')),
        );
      }
    }
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Google Map
          GoogleMap(
            mapType: MapType.satellite,
            initialCameraPosition: _initPosition,
            scrollGesturesEnabled: true,
            zoomGesturesEnabled: true,
            tiltGesturesEnabled: false,
            rotateGesturesEnabled: false,
            cameraTargetBounds: CameraTargetBounds(
              LatLngBounds(
                southwest: const LatLng(-23.4353, -46.3583),
                northeast: const LatLng(-23.4349, -46.3577),
              ),
            ),
            minMaxZoomPreference: const MinMaxZoomPreference(18.0, 20.0),
            onMapCreated: (GoogleMapController controller) {
              _controller.complete(controller);
            },
            markers: _markers,
            myLocationEnabled: _locationPermissionGranted,
            myLocationButtonEnabled: _locationPermissionGranted,
          ),

          // Floating Top Info Card & Search
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.12),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                      border: Border.all(color: const Color(0xFFE1EBE0)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF8CB83E),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.pin_drop, color: Color(0xFF13301A), size: 18),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text(
                                'Mapa — 46ª Festa do Verde',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1B261D),
                                ),
                              ),
                              Text(
                                _isLoading
                                  ? 'Carregando barracas...'
                                  : '${_shops.length} barracas • Toque no marcador para detalhes',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF566755),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Search Bar
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.12),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                      border: Border.all(color: const Color(0xFFE1EBE0)),
                    ),
                    child: Autocomplete<Product>(
                      displayStringForOption: (Product option) => option.name,
                      optionsBuilder: (TextEditingValue textEditingValue) {
                        if (textEditingValue.text.isEmpty) {
                          return const Iterable<Product>.empty();
                        }
                        return _products.where((Product product) {
                          return product.name
                              .toLowerCase()
                              .contains(textEditingValue.text.toLowerCase());
                        });
                      },
                      onSelected: _onProductSelected,
                      fieldViewBuilder: (context, controller, focusNode, onEditingComplete) {
                        void executeSearch(String value) {
                          if (value.isNotEmpty) {
                            final matches = _products.where((p) => 
                                p.name.toLowerCase().contains(value.toLowerCase()));
                            if (matches.isNotEmpty) {
                              _onProductSelected(matches.first);
                              onEditingComplete();
                            }
                          }
                        }

                        return TextField(
                          controller: controller,
                          focusNode: focusNode,
                          textInputAction: TextInputAction.search,
                          onEditingComplete: () {
                            onEditingComplete();
                            executeSearch(controller.text);
                          },
                          onSubmitted: executeSearch,
                          decoration: InputDecoration(
                            hintText: 'Pesquisar produto...',
                            hintStyle: const TextStyle(color: Color(0xFF566755)),
                            prefixIcon: IconButton(
                              icon: const Icon(Icons.search, color: Color(0xFF1E4D2B)),
                              onPressed: () => executeSearch(controller.text),
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(18),
                              borderSide: BorderSide.none,
                            ),
                            contentPadding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                        );
                      },
                      optionsViewBuilder: (context, onSelected, options) {
                        return Align(
                          alignment: Alignment.topLeft,
                          child: Material(
                            elevation: 4,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: ConstrainedBox(
                              constraints: BoxConstraints(
                                maxHeight: 200,
                                maxWidth: MediaQuery.of(context).size.width - 24,
                              ),
                              child: ListView.builder(
                                padding: EdgeInsets.zero,
                                shrinkWrap: true,
                                itemCount: options.length,
                                itemBuilder: (BuildContext context, int index) {
                                  final Product option = options.elementAt(index);
                                  return ListTile(
                                    title: Text(option.name),
                                    subtitle: Text('R\$ ${option.price.toStringAsFixed(2)}'),
                                    onTap: () {
                                      onSelected(option);
                                    },
                                  );
                                },
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

