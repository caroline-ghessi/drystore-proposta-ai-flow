import { CalculadoraTelhaShingleCompleta } from "@/components/calculadoras/CalculadoraTelhaShingleCompleta";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const CalculadoraShingleCompleta = () => {
  return (
    <ProtectedRoute requiredRoles={["vendedor", "administrador"]}>
      <div className="min-h-screen bg-background">
        <CalculadoraTelhaShingleCompleta />
      </div>
    </ProtectedRoute>
  );
};

export default CalculadoraShingleCompleta;