import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/product.dart';
import '../models/shop.dart';
import '../models/warning.dart';

class ApiService {
  static const Duration timeoutDuration = Duration(seconds: 3);

  static String get baseUrl => dotenv.env['API_URL'] ?? '';

  static String get productsUrl =>
      baseUrl.isNotEmpty ? '$baseUrl/listProducts' : 'https://listproducts-veumhwpskq-uc.a.run.app';

  static String get shopsUrl =>
      baseUrl.isNotEmpty ? '$baseUrl/listShop' : 'https://listshop-veumhwpskq-uc.a.run.app';

  static String get warningsUrl =>
      baseUrl.isNotEmpty ? '$baseUrl/listWarning' : 'https://listwarning-veumhwpskq-uc.a.run.app';

  // Chaves de armazenamento local
  static const String _kProductsCacheKey = 'kibo_cache_products';
  static const String _kShopsCacheKey = 'kibo_cache_shops';
  static const String _kWarningsCacheKey = 'kibo_cache_warnings';

  /// Busca produtos seguindo a política Network-First (Internet primeiro, Cache local se falhar)
  static Future<List<Product>> getProducts() async {
    try {
      final response = await http.get(Uri.parse(productsUrl)).timeout(timeoutDuration);
      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_kProductsCacheKey, response.body);

        final List<dynamic> jsonList = jsonDecode(response.body);
        return jsonList.map((json) => Product.fromJson(json)).toList();
      }
    } catch (_) {
      // Ignora erro de rede/timeout para tentar o cache
    }

    // Fallback: Cache local
    final prefs = await SharedPreferences.getInstance();
    final cached = prefs.getString(_kProductsCacheKey);
    if (cached != null && cached.isNotEmpty) {
      final List<dynamic> jsonList = jsonDecode(cached);
      return jsonList.map((json) => Product.fromJson(json)).toList();
    }

    throw Exception('Falha ao carregar os produtos do cardápio');
  }

  /// Busca barracas/lojas seguindo a política Network-First (Internet primeiro, Cache local se falhar)
  static Future<List<Shop>> getShops() async {
    try {
      final response = await http.get(Uri.parse(shopsUrl)).timeout(timeoutDuration);
      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_kShopsCacheKey, response.body);

        final List<dynamic> jsonList = jsonDecode(response.body);
        return jsonList.map((json) => Shop.fromJson(json)).toList();
      }
    } catch (_) {
      // Ignora erro de rede/timeout para tentar o cache
    }

    // Fallback: Cache local
    final prefs = await SharedPreferences.getInstance();
    final cached = prefs.getString(_kShopsCacheKey);
    if (cached != null && cached.isNotEmpty) {
      final List<dynamic> jsonList = jsonDecode(cached);
      return jsonList.map((json) => Shop.fromJson(json)).toList();
    }

    throw Exception('Falha ao carregar as barracas do evento');
  }

  /// Busca avisos seguindo a política Network-First (Internet primeiro, Cache local se falhar)
  static Future<List<Warning>> getWarnings() async {
    try {
      final response = await http.get(Uri.parse(warningsUrl)).timeout(timeoutDuration);
      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_kWarningsCacheKey, response.body);

        final List<dynamic> jsonList = jsonDecode(response.body);
        final warnings = jsonList.map((json) => Warning.fromJson(json)).toList();
        warnings.sort((a, b) => b.timestamp.compareTo(a.timestamp));
        return warnings;
      }
    } catch (_) {
      // Ignora erro de rede/timeout para tentar o cache
    }

    // Fallback: Cache local
    final prefs = await SharedPreferences.getInstance();
    final cached = prefs.getString(_kWarningsCacheKey);
    if (cached != null && cached.isNotEmpty) {
      final List<dynamic> jsonList = jsonDecode(cached);
      final warnings = jsonList.map((json) => Warning.fromJson(json)).toList();
      warnings.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      return warnings;
    }

    throw Exception('Falha ao carregar comunicados oficiais');
  }
}
