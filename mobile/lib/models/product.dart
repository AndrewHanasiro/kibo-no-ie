class Product {
  final String id;
  final String name;
  final double price;
  final bool isAvailable;
  int quantity;

  Product({
    required this.id,
    required this.name,
    required this.price,
    required this.isAvailable,
    this.quantity = 0,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      name: json['name'] as String,
      price: (json['price'] as num).toDouble(),
      isAvailable: json['isAvailable'] as bool,
    );
  }
}
