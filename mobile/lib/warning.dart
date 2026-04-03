import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'models/warning.dart'; // Import the model we created

const String apiUrl = 'https://listwarning-veumhwpskq-uc.a.run.app';

class WarningBoard extends StatefulWidget {
  const WarningBoard({super.key});

  @override
  State<WarningBoard> createState() => _WarningBoardState();
}

class _WarningBoardState extends State<WarningBoard> {
  // State variables
  late Future<List<Warning>> _warningList;

  @override
  void initState() {
    super.initState();
    _warningList = _fetchProducts();
  }

  // --- Data Fetching Function ---
  Future<List<Warning>> _fetchProducts() async {
    final response = await http.get(Uri.parse(apiUrl));

    if (response.statusCode == 200) {
      final List<dynamic> jsonList = jsonDecode(response.body);
      return jsonList.map((json) => Warning.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load products');
    }
  }



  // --- Widget Build ---

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quadro de avisos'),
        backgroundColor: Colors.blueGrey,
      ),
      body: FutureBuilder<List<Warning>>(
        future: _warningList,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Erro: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('Nenhum warning encontrado'));
          }

          // Data successfully loaded
          final warningList = snapshot.data!;

          return Column(
            children: [
              // 1. Product List
              Expanded(
                child: ListView.builder(
                  itemCount: warningList.length,
                  itemBuilder: (context, index) {
                    final warning = warningList[index];
                    return WarningItemTile(
                      warning: warning,
                    );
                  },
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
class WarningItemTile extends StatelessWidget {
  final Warning warning;

  const WarningItemTile({
    super.key,
    required this.warning,
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
                    warning.text,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
