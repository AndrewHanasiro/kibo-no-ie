class Product {
  final String id;
  final String name;
  final double price;
  final String category;

  final bool isAvailable;
  int quantity;

  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.category,
    required this.isAvailable,
    this.quantity = 0,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
      category: json['category'] as String,
      isAvailable: json['isAvailable'] as bool,
    );
  }
}
