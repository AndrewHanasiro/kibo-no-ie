import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:kibo_no_ie/models/shop.dart';

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
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchShops();
  }

  Future<void> _fetchShops() async {
    const String shopApiUrl = 'https://listshop-veumhwpskq-uc.a.run.app';
    try {
      final response = await http.get(Uri.parse(shopApiUrl));

      if (response.statusCode == 200) {
        final List<dynamic> jsonList = jsonDecode(response.body);
        final fetchedShops = jsonList.map((json) => Shop.fromJson(json)).toList();

        if (mounted) {
          setState(() {
            _shops = fetchedShops;
            _isLoading = false;
            _markers = _shops.map((shop) {
              return Marker(
                markerId: MarkerId(shop.id),
                position: LatLng(shop.latitude, shop.longitude),
                infoWindow: InfoWindow(
                  title: shop.name,
                  snippet: 'Toque para ver a barraca',
                  onTap: () => _showShopDetails(shop),
                ),
                onTap: () => _showShopDetails(shop),
              );
            }).toSet();
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Google Map
          GoogleMap(
            mapType: MapType.satellite,
            initialCameraPosition: _initPosition,
            scrollGesturesEnabled: false,
            zoomGesturesEnabled: true,
            tiltGesturesEnabled: false,
            rotateGesturesEnabled: false,
            onMapCreated: (GoogleMapController controller) {
              _controller.complete(controller);
            },
            markers: _markers,
          ),

          // Floating Top Info Card
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Container(
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
                            'Mapa — 45ª Festa do Verde',
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
            ),
          ),
        ],
      ),
    );
  }
}

