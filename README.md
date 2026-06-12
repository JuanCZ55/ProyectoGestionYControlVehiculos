# 🚚 Sistema de Gestión y Control de Vehículos para Transporte de Residuos

Este documento describe los requerimientos funcionales para el sistema de gestión y control de la flota de vehículos.

---

## ✨ Requerimientos del Sistema

### 🛣️ 1. Control de Kilometraje

- El control de kilometraje de vehículos se realiza **1 vez en la semana**.

---

### 🛞 2. Control de Desgaste de Neumáticos

El módulo de neumáticos debe gestionar:

- **Asentamiento del cambio de neumáticos.**
- Registro de la **marca**.
- Indicación si son **recapados o estándar**.
- Mantenimiento de un **control de los kilómetros de rodado**.
- Registro de **desgaste irregular**.
- Consideración de la cantidad de neumáticos por vehículo: **4 + auxilio o 6 + auxilio**.

---

### 📋 3. Checklist Diario

El checklist se realiza **todos los días** y debe controlar los siguientes puntos:

- Faros delanteros
- Faros traseros
- Nivel de Aceite
- Presión de neumáticos
- Nivel de líquido de frenos
- Nivel de refrigerante
- Nivel de líquido de parabrisas
- Control vigencia de Matafuegos

---

### 🛠️ 4. Control de Services

#### Servicios Programados

- Asiento del **último service (kilometraje)**.
- Registro del **tipo de service**:
  - Cambio de aceite y filtros (filtros de aire / Filtro de gas oíl / filtro de aceite / Poli-B / Correa dentada).
  - Rotación, alineación y balanceo.
- Indicación del **kilometraje para el próximo service con aviso en dashboard**.
- Control del **kilometraje para cambio de correa dentada poli B y bomba de agua**.

#### Servicios Extraordinarios

- Capacidad de registrar servicios como:
  - Reparación de ejes
  - Caja de cambios
  - Bomba de gas oíl
  - Chapa y pintura
  - Reparación de zona de carga

---

### 🗂️ 5. Gestión de Documentación

El sistema debe guardar la siguiente documentación del vehículo:

- Tarjeta verde
- Título
- Permisos de conducción a empleados

---

### 💬 6. Servicio de Comunicación

- Servicio de **chat** para asentar **pedidos de materiales** (focos, aceite, líquido refrigerante, líquido de limpiaparabrisas).
- Dar **aviso de cuestiones extraordinarias**.

---

### 🔒 7. Seguridad y Auditoría

El sistema debe incluir:

- Sistema de **usuarios** con **Log in – password**.
- **Autenticación**.
- Servicio de **auditoría**.
- **Avatares de usuario**.

---
