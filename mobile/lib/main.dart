import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:kibo_no_ie/map.dart';
import 'package:kibo_no_ie/market.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:kibo_no_ie/warning.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);
  runApp(const NavigationBarApp());
}

class NavigationBarApp extends StatelessWidget {
  const NavigationBarApp({super.key});

  @override
  Widget build(BuildContext context) {
    if (Platform.isIOS) {
      return const CupertinoApp(home: NavigationExample());
    } else {
      return const MaterialApp(home: NavigationExample());
    }
  }
}

class NavigationExample extends StatefulWidget {
  const NavigationExample({super.key});

  @override
  State<NavigationExample> createState() => _NavigationExampleState();
}

class _NavigationExampleState extends State<NavigationExample> {
  int currentPageIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: NavigationBar(
        onDestinationSelected: (int index) {
          setState(() {
            currentPageIndex = index;
          });
        },
        indicatorColor: const Color.fromARGB(179, 3, 173, 3),
        selectedIndex: currentPageIndex,
        destinations: const <Widget>[
          NavigationDestination(
            selectedIcon: Icon(Icons.map_outlined),
            icon: Icon(Icons.map),
            label: 'Mapa',
          ),
          NavigationDestination(
            selectedIcon: Icon(Icons.food_bank_outlined),
            icon: Icon(Icons.food_bank),
            label: 'Comidas',
          ),
          NavigationDestination(
            selectedIcon: Icon(Icons.campaign_outlined),
            icon: Icon(Icons.campaign),
            label: 'Avisos',
          ),
        ],
      ),
      body: <Widget>[Map(), Market(), WarningBoard()][currentPageIndex],
    );
  }
}
