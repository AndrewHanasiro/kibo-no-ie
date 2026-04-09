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

        setState(() {
          _shops = fetchedShops;
          _markers = _shops.map((shop) {
            return Marker(
              markerId: MarkerId(shop.id),
              position: LatLng(shop.latitude, shop.longitude),
              infoWindow: InfoWindow(
                title: shop.name,
                snippet: 'Toque para ver detalhes',
                onTap: () => _showShopDetails(shop),
              ),
              onTap: () => _showShopDetails(shop),
            );
          }).toSet();
        });
      } else {
        print('Failed to load shops: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching shops: $e');
    }
  }

  void _showShopDetails(Shop shop) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(shop.name, textAlign: TextAlign.center),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Image.network(
                shop.image,
                width: 150,
                height: 150,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => const Icon(Icons.broken_image),
              ),
              const SizedBox(height: 10),
            ],
          ),
          actions: <Widget>[
            TextButton(
              child: const Text('Fechar'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GoogleMap(
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
    );
  }
}
