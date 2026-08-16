import 'dart:io';

import 'package:flutter/material.dart';
import 'package:kibo_no_ie/map.dart';

import 'package:kibo_no_ie/market.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:kibo_no_ie/warning.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

  // Configure Firebase Cloud Messaging
  FirebaseMessaging messaging = FirebaseMessaging.instance;
  
  // Request permissions for iOS and newer Android versions
  NotificationSettings settings = await messaging.requestPermission(
    alert: true,
    badge: true,
    sound: true,
  );
  print('User granted permission: ${settings.authorizationStatus}');

  // Subscribe to the "warnings" topic to receive official warnings
  await messaging.subscribeToTopic('warnings');
  print('Subscribed to warnings topic');

  // Listen for foreground messages
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    print('Received foreground message: ${message.notification?.title}');
    // Here you could show a local notification or an in-app banner if desired.
  });

  runApp(const NavigationBarApp());
}

class NavigationBarApp extends StatelessWidget {
  const NavigationBarApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Custom Festa do Verde Theme
    final themeData = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF1E4D2B), // Forest Green
        primary: const Color(0xFF1E4D2B),
        onPrimary: Colors.white,
        secondary: const Color(0xFF8CB83E), // Leaf Green
        onSecondary: const Color(0xFF13301A),
        surface: const Color(0xFFFAFBF8),
        onSurface: const Color(0xFF1B261D),
      ),
      scaffoldBackgroundColor: const Color(0xFFF5F8F2),
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF1E4D2B),
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.2,
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.white,
        elevation: 8,
        indicatorColor: const Color(0xFF8CB83E).withValues(alpha: 0.3),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E4D2B),
            );
          }
          return const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: Color(0xFF566755),
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: Color(0xFF1E4D2B), size: 24);
          }
          return const IconThemeData(color: Color(0xFF566755), size: 24);
        }),
      ),
    );

    if (Platform.isIOS) {
      return MaterialApp(
        title: 'Kibô-no-Iê — 46ª Festa do Verde',
        theme: themeData,
        debugShowCheckedModeBanner: false,
        home: const NavigationExample(),
      );
    } else {
      return MaterialApp(
        title: 'Kibô-no-Iê — 46ª Festa do Verde',
        theme: themeData,
        debugShowCheckedModeBanner: false,
        home: const NavigationExample(),
      );
    }
  }
}

class NavigationExample extends StatefulWidget {
  const NavigationExample({super.key});

  @override
  State<NavigationExample> createState() => _NavigationExampleState();
}

class _NavigationExampleState extends State<NavigationExample> {
  int currentPageIndex = 1; // Default to Market (Food/Drinks) for quick guest ordering

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: NavigationBar(
          onDestinationSelected: (int index) {
            setState(() {
              currentPageIndex = index;
            });
          },
          selectedIndex: currentPageIndex,
          destinations: const <Widget>[
            NavigationDestination(
              selectedIcon: Icon(Icons.map),
              icon: Icon(Icons.map_outlined),
              label: 'Mapa',
            ),
            NavigationDestination(
              selectedIcon: Icon(Icons.restaurant_menu),
              icon: Icon(Icons.restaurant_menu_outlined),
              label: 'Comidas',
            ),
            NavigationDestination(
              selectedIcon: Icon(Icons.campaign),
              icon: Icon(Icons.campaign_outlined),
              label: 'Avisos',
            ),
          ],
        ),
      ),
      body: <Widget>[
        const Map(),
        const Market(),
        const WarningBoard(),
      ][currentPageIndex],
    );
  }
}

