'use client';
import { useState } from 'react';
import { Brain, Lightbulb, ShieldAlert, CheckSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/common/page-header';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { predictiveSafetyAnalysis, type HazardAnalysis, type IncidentReport } from '@/ai/flows/predictive-safety-analysis';
import { useToast } from '@/hooks/use-toast';

export default function PredictiveAnalysisPage() {
  const [reportText, setReportText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<HazardAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Required', // i18n: predictiveAnalysis.inputRequiredTitle
        description: 'Please enter an incident report text to analyze.', // i18n: predictiveAnalysis.inputRequiredDesc
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const report: IncidentReport = { reportText };
      const result = await predictiveSafetyAnalysis(report);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during analysis.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed', // i18n: predictiveAnalysis.analysisFailedTitle
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevelBadgeVariant = (riskLevel: 'low' | 'medium' | 'high' | undefined) => {
    switch (riskLevel) {
      case 'low':
        return 'default'; // Default is often blue/primary or green-ish
      case 'medium':
        return 'secondary'; // Secondary for warning/yellow
      case 'high':
        return 'destructive'; // Destructive for error/red
      default:
        return 'outline';
    }
  };
   const getRiskLevelClass = (riskLevel: 'low' | 'medium' | 'high' | undefined) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'high':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  return (
    <>
      <PageHeader
        title="Predictive Safety Analysis" // i18n: predictiveAnalysis.title
        description="AI-powered tool to analyze incident reports, identify hazards, and suggest preventative measures." // i18n: predictiveAnalysis.description
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-6 w-6 text-primary" />
            {/* i18n: predictiveAnalysis.inputCardTitle */}
            Incident Report Input
          </CardTitle>
          <CardDescription>
            {/* i18n: predictiveAnalysis.inputCardDesc */}
            Paste the full text of the incident report below for analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter incident report text here..." // i18n: predictiveAnalysis.textareaPlaceholder
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={10}
            className="mb-4 text-base"
            disabled={isLoading}
            data-ai-hint="incident report text details"
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isLoading || !reportText.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {/* i18n: predictiveAnalysis.analyzingButton */}
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                {/* i18n: predictiveAnalysis.analyzeButton */}
                Analyze Report
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{/* i18n: predictiveAnalysis.errorAlertTitle */}Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <Card className="mt-8 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Lightbulb className="mr-3 h-7 w-7 text-accent" />
              {/* i18n: predictiveAnalysis.resultsCardTitle */}
              Analysis Results
            </CardTitle>
             <div className="flex items-center mt-2">
                <span className="text-sm font-medium mr-2">{/* i18n: predictiveAnalysis.riskLevelLabel */}Overall Risk Level:</span>
                <Badge variant={getRiskLevelBadgeVariant(analysisResult.riskLevel)} className={`px-3 py-1 text-sm ${getRiskLevelClass(analysisResult.riskLevel)}`}>
                  {analysisResult.riskLevel.toUpperCase()}
                </Badge>
              </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <ShieldAlert className="mr-2 h-5 w-5 text-destructive" />
                {/* i18n: predictiveAnalysis.hazardsIdentifiedTitle */}
                Hazards Identified
              </h3>
              {analysisResult.hazardsIdentified.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2 text-muted-foreground">
                  {analysisResult.hazardsIdentified.map((hazard, index) => (
                    <li key={index}>{hazard}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic">{/* i18n: predictiveAnalysis.noHazardsIdentified */}No specific hazards identified based on the report.</p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <CheckSquare className="mr-2 h-5 w-5 text-green-600" />
                {/* i18n: predictiveAnalysis.preventativeMeasuresTitle */}
                Suggested Preventative Measures
              </h3>
              {analysisResult.preventativeMeasures.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2 text-muted-foreground">
                  {analysisResult.preventativeMeasures.map((measure, index) => (
                    <li key={index}>{measure}</li>
                  ))}
                </ul>
              ) : (
                 <p className="text-muted-foreground italic">{/* i18n: predictiveAnalysis.noMeasuresSuggested */}No specific preventative measures suggested.</p>
              )}
            </div>
            
            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-2">{/* i18n: predictiveAnalysis.justificationTitle */}Justification</h3>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed p-4 bg-muted rounded-md border">
                {analysisResult.justification}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
