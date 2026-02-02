// ============================================
// EJEMPLO FLUTTER - Estadísticas de Servidores VPN
// ============================================
// Copiar este código para implementar en la app VPN
// Endpoints públicos - NO requieren autenticación
// ============================================

import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;

// ============================================
// MODELOS
// ============================================

class ServerStats {
  final int? serverId;
  final String serverName;
  final String location;
  final String status; // "online" | "offline"
  final int connectedUsers;
  final double? cpuUsage;
  final double? memoryUsage;
  final int? totalUsuarios;
  final DateTime lastUpdate;

  ServerStats({
    this.serverId,
    required this.serverName,
    required this.location,
    required this.status,
    required this.connectedUsers,
    this.cpuUsage,
    this.memoryUsage,
    this.totalUsuarios,
    required this.lastUpdate,
  });

  factory ServerStats.fromJson(Map<String, dynamic> json) {
    return ServerStats(
      serverId: json['serverId'],
      serverName: json['serverName'] ?? 'Unknown',
      location: json['location'] ?? 'Desconocido',
      status: json['status'] ?? 'offline',
      connectedUsers: json['connectedUsers'] ?? 0,
      cpuUsage: (json['cpuUsage'] as num?)?.toDouble(),
      memoryUsage: (json['memoryUsage'] as num?)?.toDouble(),
      totalUsuarios: json['totalUsuarios'],
      lastUpdate: DateTime.tryParse(json['lastUpdate'] ?? '') ?? DateTime.now(),
    );
  }

  bool get isOnline => status == 'online';
  
  // Nivel de carga: 0 = bajo, 1 = medio, 2 = alto
  int get loadLevel {
    if (cpuUsage == null) return 0;
    if (cpuUsage! < 50) return 0; // Verde
    if (cpuUsage! < 80) return 1; // Amarillo
    return 2; // Rojo
  }
}

class ServersSnapshot {
  final DateTime fetchedAt;
  final int totalUsers;
  final int onlineServers;
  final List<ServerStats> servers;

  ServersSnapshot({
    required this.fetchedAt,
    required this.totalUsers,
    required this.onlineServers,
    required this.servers,
  });

  factory ServersSnapshot.fromJson(Map<String, dynamic> json) {
    final serverStats = json['data']?['serverStats'] ?? json['serverStats'] ?? json;
    
    return ServersSnapshot(
      fetchedAt: DateTime.tryParse(serverStats['fetchedAt'] ?? '') ?? DateTime.now(),
      totalUsers: serverStats['totalUsers'] ?? 0,
      onlineServers: serverStats['onlineServers'] ?? 0,
      servers: (serverStats['servers'] as List<dynamic>?)
          ?.map((s) => ServerStats.fromJson(s))
          .toList() ?? [],
    );
  }
}

// ============================================
// SERVICIO API
// ============================================

class VpnServersService {
  static const String baseUrl = 'https://shop.jhservices.com.ar/api';
  
  // Singleton
  static final VpnServersService _instance = VpnServersService._internal();
  factory VpnServersService() => _instance;
  VpnServersService._internal();

  /// Obtiene snapshot actual de todos los servidores
  /// Usar para carga inicial o fallback
  Future<ServersSnapshot> getSnapshot() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/realtime/snapshot'),
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return ServersSnapshot.fromJson(json);
      } else {
        throw Exception('Error ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error obteniendo estado de servidores: $e');
    }
  }

  /// Alternativa: endpoint /stats/servidores
  Future<ServersSnapshot> getServersStats() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/stats/servidores'),
      );

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        
        // Este endpoint tiene estructura ligeramente diferente
        return ServersSnapshot(
          fetchedAt: DateTime.tryParse(json['ultimaActualizacion'] ?? '') ?? DateTime.now(),
          totalUsers: json['totalUsuarios'] ?? 0,
          onlineServers: json['onlineServers'] ?? json['servidoresOnline'] ?? 0,
          servers: (json['servidores'] as List<dynamic>?)
              ?.map((s) => ServerStats.fromJson(s))
              .toList() ?? [],
        );
      } else {
        throw Exception('Error ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error obteniendo stats: $e');
    }
  }
}

// ============================================
// PROVIDER/CONTROLLER (Ejemplo con polling)
// ============================================

class ServersController {
  final VpnServersService _service = VpnServersService();
  
  ServersSnapshot? _snapshot;
  Timer? _pollingTimer;
  bool _isLoading = false;
  String? _error;

  // Getters
  ServersSnapshot? get snapshot => _snapshot;
  List<ServerStats> get servers => _snapshot?.servers ?? [];
  int get totalUsers => _snapshot?.totalUsers ?? 0;
  int get onlineServers => _snapshot?.onlineServers ?? 0;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Cargar datos iniciales
  Future<void> loadServers() async {
    _isLoading = true;
    _error = null;
    // notifyListeners(); // si usas ChangeNotifier

    try {
      _snapshot = await _service.getSnapshot();
      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      // notifyListeners();
    }
  }

  /// Iniciar polling cada X segundos
  void startPolling({int intervalSeconds = 30}) {
    stopPolling();
    _pollingTimer = Timer.periodic(
      Duration(seconds: intervalSeconds),
      (_) => loadServers(),
    );
  }

  /// Detener polling
  void stopPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
  }

  /// Limpiar recursos
  void dispose() {
    stopPolling();
  }
}

// ============================================
// EJEMPLO DE USO EN WIDGET
// ============================================

/*
class ServersScreen extends StatefulWidget {
  @override
  _ServersScreenState createState() => _ServersScreenState();
}

class _ServersScreenState extends State<ServersScreen> {
  final ServersController _controller = ServersController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await _controller.loadServers();
    _controller.startPolling(intervalSeconds: 30);
    setState(() {});
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_controller.isLoading && _controller.servers.isEmpty) {
      return Center(child: CircularProgressIndicator());
    }

    return Column(
      children: [
        // Header con total
        Padding(
          padding: EdgeInsets.all(16),
          child: Text(
            '${_controller.totalUsers} usuarios online',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
        ),
        
        // Lista de servidores
        Expanded(
          child: ListView.builder(
            itemCount: _controller.servers.length,
            itemBuilder: (context, index) {
              final server = _controller.servers[index];
              return ServerTile(server: server);
            },
          ),
        ),
      ],
    );
  }
}

class ServerTile extends StatelessWidget {
  final ServerStats server;
  
  const ServerTile({required this.server});

  Color get statusColor {
    if (!server.isOnline) return Colors.grey;
    switch (server.loadLevel) {
      case 0: return Colors.green;
      case 1: return Colors.orange;
      default: return Colors.red;
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(Icons.circle, color: statusColor, size: 12),
      title: Text(server.serverName),
      subtitle: Text(server.location),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            '${server.connectedUsers} usuarios',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          if (server.cpuUsage != null)
            Text(
              'CPU: ${server.cpuUsage!.toStringAsFixed(0)}%',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
        ],
      ),
    );
  }
}
*/
