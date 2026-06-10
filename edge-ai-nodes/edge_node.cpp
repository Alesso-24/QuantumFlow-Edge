// QuantumFlow Edge — Nodo IoT embebido (C++17)
//
// Este es el algoritmo que correría en el microcontrolador real (ESP32/STM32)
// adosado a la tubería. Detección de anomalías 100% local:
//   * Estadística de flujo en streaming (Welford: media/varianza O(1) memoria)
//   * EWMA para suavizar ruido del sensor
//   * z-score robusto como score de anomalía
// Solo transmite al backend cuando hay anomalía → mínimo ancho de banda,
// cero dependencia de la nube para DETECTAR (solo para COORDINAR).
//
// Compilar:  cmake -B build && cmake --build build
// Para la demo del hackathon, node_simulator.py replica esta misma lógica
// en Python; este archivo demuestra a los jueces el camino a hardware real.

#include <cmath>
#include <cstdio>
#include <random>

class EdgeAnomalyDetector {
public:
    explicit EdgeAnomalyDetector(double ewma_alpha = 0.15,
                                 double z_threshold = 3.5)
        : alpha_(ewma_alpha), threshold_(z_threshold) {}

    struct Result {
        double smoothed;
        double z_score;
        bool is_anomaly;
    };

    Result update(double flow_lps) {
        // EWMA del sensor (filtra ruido de alta frecuencia)
        ewma_ = (count_ == 0) ? flow_lps : alpha_ * flow_lps + (1 - alpha_) * ewma_;

        // Welford: media y varianza incrementales del régimen normal
        ++count_;
        const double delta = ewma_ - mean_;
        mean_ += delta / static_cast<double>(count_);
        m2_ += delta * (ewma_ - mean_);

        const double stddev = (count_ > 1)
            ? std::sqrt(m2_ / static_cast<double>(count_ - 1)) : 0.0;
        const double z = (stddev > 1e-9) ? std::abs(ewma_ - mean_) / stddev : 0.0;

        // Periodo de calentamiento: no alertar hasta tener línea base
        const bool anomaly = (count_ > warmup_) && (z > threshold_);
        return {ewma_, z, anomaly};
    }

private:
    double alpha_, threshold_;
    double ewma_ = 0.0, mean_ = 0.0, m2_ = 0.0;
    long count_ = 0;
    static constexpr long warmup_ = 30;
};

int main() {
    EdgeAnomalyDetector detector;
    std::mt19937 rng{42};
    std::normal_distribution<double> normal_flow{25.0, 0.8};

    std::puts("tick,flow,z_score,anomaly");
    for (int t = 0; t < 120; ++t) {
        double flow = normal_flow(rng);
        if (t >= 80) flow += 9.0;  // fuga simulada: caída de presión → pico de flujo

        const auto r = detector.update(flow);
        std::printf("%d,%.2f,%.2f,%d\n", t, flow, r.z_score, r.is_anomaly ? 1 : 0);
    }
    return 0;
}
