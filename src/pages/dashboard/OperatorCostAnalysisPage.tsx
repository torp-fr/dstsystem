import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import OperatorCostCalculator from '@/components/dashboard/OperatorCostCalculator';

export default function OperatorCostAnalysisPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/operators')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Analyse Comparative des Coûts</h1>
          <p className="text-muted-foreground mt-2">
            Comparez les différents types de contrats et identifiez la solution la plus rentable
          </p>
        </div>
      </div>

      {/* Calculator */}
      <OperatorCostCalculator />
    </div>
  );
}
