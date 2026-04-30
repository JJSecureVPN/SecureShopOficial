# 🚀 Guía Maestra de Optimización para Servidores VPN (JJSecure)

Este tutorial contiene la configuración óptima para servidores VPS destinados a servicios de VPN (SSH, DTunnel, V2Ray), diseñada para manejar cientos de usuarios sin saturar el CPU.

---

## 📋 Fase 1: Diagnóstico de Carga
Antes de empezar, verificá si el servidor está sufriendo por gestión de sesiones.
```bash
uptime
ps aux --sort=-%cpu | head -n 10
```
*Si `systemd-logind` consume más del 50% de CPU, esta guía es obligatoria.*

---

## 🚨 Fase 2: Limpieza de Emergencia (Si el VPS está colapsado)
Si no podés ni escribir comandos, ejecutá esto para liberar el CPU al instante:

1. **Matar procesos de usuarios:**
   ```bash
   ps aux | grep 'sshd:' | awk '{print $2}' | xargs kill -9
   ```
2. **Reiniciar servicios básicos:**
   ```bash
   systemctl restart systemd-logind
   systemctl restart ssh
   ```

---

## 🌐 Fase 3: Redirección de Puertos (Evitar errores de "Port Failed")
Muchos clientes buscan puertos que no existen (ej. 7000 o 7300), lo que genera errores masivos en el log. Redirigí esos puertos al puerto real donde corre tu servicio (ej. 7100).

```bash
# Redirigir puertos huérfanos al puerto real (7100)
iptables -t nat -A PREROUTING -p tcp --dport 7000 -j REDIRECT --to-port 7100
iptables -t nat -A PREROUTING -p tcp --dport 7300 -j REDIRECT --to-port 7100
iptables -t nat -A PREROUTING -p udp --dport 7000 -j REDIRECT --to-port 7100
iptables -t nat -A PREROUTING -p udp --dport 7300 -j REDIRECT --to-port 7100

# Hacer las reglas permanentes
apt-get install iptables-persistent -y
netfilter-persistent save
```

---

## ⚡ Fase 4: Boost de Velocidad (TCP BBR de Google)
Activa el algoritmo que reduce el lag y aumenta la velocidad de descarga en conexiones móviles inestables.

1. **Editar configuración de red:** `nano /etc/sysctl.conf`
2. **Asegurarte de que estas líneas estén presentes (y separadas):**
   ```text
   net.ipv4.ip_forward = 1
   net.core.default_qdisc = fq
   net.ipv4.tcp_congestion_control = bbr
   ```
3. **Aplicar cambios:** `sysctl -p`

---

## 🏗️ Fase 5: Estabilidad de Sesiones (systemd-logind)
Evitá que se acumulen sesiones "zombie" que consumen memoria y CPU.

1. **Editar:** `nano /etc/systemd/logind.conf`
2. **Reemplazar/Agregar este bloque:**
   ```ini
   [Login]
   KillUserProcesses=yes
   UserStopDelaySec=0
   RuntimeDirectorySize=20%
   SessionsMax=10000
   RemoveIPC=yes
   ```
3. **Reiniciar:** `systemctl restart systemd-logind`

---

## 📈 Fase 6: Límites de Recursos y SSH
Permite que el sistema abra miles de archivos (conexiones) simultáneamente.

### 6.1 Límites del Sistema
Editar `nano /etc/security/limits.conf` y agregar al final:
```text
* soft nproc 65535
* hard nproc 65535
* soft nofile 100000
* hard nofile 100000
root soft nproc 65535
root hard nproc 65535
root soft nofile 100000
root hard nofile 100000
```

### 6.2 Optimización de SSH
Editar `nano /etc/ssh/sshd_config` y buscar/agregar:
```text
UseDNS no
MaxStartups 100:30:200
MaxSessions 100
ClientAliveInterval 60
ClientAliveCountMax 3
```
*Reiniciar con:* `systemctl restart ssh`

---

## ✅ Resumen de Verificación Final
Después de aplicar todo, el comando `uptime` debería mostrar una carga menor a **2.00** incluso con cientos de usuarios, y la conexión debería sentirse instantánea.

---
*Documentación generada para JJSecure VPN - 2026*
