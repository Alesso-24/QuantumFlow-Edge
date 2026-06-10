# 📦 Guía de Builds y Distribución — QuantumFlow Edge

Estado de cada plataforma y cómo obtener el ejecutable.

| Plataforma | Cómo se obtiene | Estado |
|---|---|---|
| 🪟 Windows (.exe) | `backend-quantum/dist/QuantumFlowCore.exe` (PyInstaller) | ✅ Compilado y probado localmente |
| 🌐 Web online | GitHub Pages (deploy automático en cada push a `main`) | ✅ Automático — con modo demo sin backend |
| 🤖 Android (.apk) | GitHub Actions → pestaña *Actions* → artifact `QuantumFlowEdge-APK`, o *Releases* al taggear `v*` | ✅ Automático en la nube |
| 🤖 Play Store | Requiere cuenta de Google Play Developer (ver abajo) | ⚠️ Manual — requiere tu cuenta |
| 🍎 iOS / iPadOS | EAS Build en la nube (ver abajo) | ⚠️ Requiere cuenta Apple Developer |
| 🍎 macOS | Misma app vía Mac Catalyst/EAS, o la versión web | ⚠️ Requiere Mac para distribución |

---

## 🪟 Windows — QuantumFlowCore.exe

El backend completo (API + WebSocket + optimizador QUBO) en un solo `.exe`, sin Python:

```powershell
cd backend-quantum
.venv\Scripts\pyinstaller --onefile --name QuantumFlowCore --add-data "data;data" --clean --noconfirm run_server.py
# Resultado: dist\QuantumFlowCore.exe  →  doble clic y el core está en http://localhost:8000
# (--add-data empaqueta la red real de Puebla dentro del ejecutable)
```

> Nota: el .exe incluye el solver Simulated Annealing (misma matriz QUBO).
> Para correr QAOA real se usa el entorno Python con Qiskit (`pip install -r requirements.txt`).

## 🌐 Web online (GitHub Pages)

Cada push a `main` que toque `multiplatform-app/` dispara `deploy-web.yml`:
`npm ci → expo export → deploy`. URL: **https://alesso-24.github.io/QuantumFlow-Edge/**

⚠️ **Activación única (1 minuto):** en GitHub → *Settings → Pages → Source: GitHub Actions*.

La versión online no puede conectarse a `localhost`, así que entra automáticamente en
**🎮 MODO DEMO**: simula la red y las optimizaciones dentro del navegador. Perfecto
para compartir el link con los jueces.

## 🤖 Android — APK

**Opción A (automática, sin cuentas):** GitHub Actions compila el APK en cada push.
- Descarga: pestaña **Actions** → último run de *Build — APK Android* → artifact `QuantumFlowEdge-APK`.
- Para un **Release público descargable**: `git tag v1.0.0 && git push --tags`.
- El APK va firmado con la llave debug estándar: instalable en cualquier teléfono
  (activar "Instalar apps de origen desconocido"). Suficiente para la demo del hackathon.

**Opción B (EAS, recomendada para Play Store):**
```bash
npm install -g eas-cli
eas login                      # cuenta gratuita de Expo
cd multiplatform-app
eas build -p android --profile preview      # APK instalable
eas build -p android --profile production   # AAB para Play Store
```

### Subir a Play Store (manual — requiere TU cuenta)
1. Crear cuenta en https://play.google.com/console (pago único de $25 USD).
2. `eas build -p android --profile production` → genera el `.aab` firmado.
3. Play Console → *Crear app* → subir el `.aab` a *Pruebas internas* (la revisión de
   producción tarda días; pruebas internas es inmediato y da link instalable).
4. Opcional CI: `eas submit -p android` con una service account de Google Cloud.

> ⏱️ Realidad de hackathon: la revisión de Play Store tarda 1–7 días. Para el evento,
> usa el APK del Release de GitHub + un QR al link de descarga. Mismo efecto, cero espera.

## 🍎 iOS / iPadOS / macOS

Apple exige compilar con Xcode (solo macOS) y cuenta Apple Developer ($99/año).
**No se puede compilar desde Windows**, pero EAS Build lo hace en la nube:

```bash
eas build -p ios --profile preview    # compila en Macs de Expo, sin tener Mac
eas submit -p ios                     # sube a TestFlight
```

- **iPadOS**: ya soportado (`"supportsTablet": true` en `app.json`).
- **macOS**: las apps iPad corren nativamente en Macs Apple Silicon (se activa al
  publicar en App Store), o usa la versión web que es idéntica.
- **Demo sin cuenta Apple**: instala **Expo Go** en el iPhone/iPad y escanea el QR de
  `npx expo start` — la app corre al instante en el dispositivo. Así se demuestra
  "multiplataforma absoluto" ante los jueces sin pagar los $99.

## 🧪 CI

`ci.yml` corre en cada push: smoke test del optimizador QUBO (Python 3.11) y
compilación + verificación del detector C++ (la fuga sintética DEBE detectarse).
