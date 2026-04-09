class Shop {
  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final String image;

  Shop({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.image,
  });

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      id: json['id'] as String,
      name: json['name'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      image: json['image'] as String,
    );
  }
}