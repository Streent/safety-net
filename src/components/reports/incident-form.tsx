
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, CloudUpload, MapPin, Edit3, LocateFixed, ImageIcon } from 'lucide-react'; // Added LocateFixed, ImageIcon
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription as UiFormDescription } from "@/components/ui/form"; // Renamed FormDescription to avoid conflict
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

// This schema is a placeholder. 
// TODO: Integrate AI flow (e.g., generateIncidentForm) to dynamically generate schema based on incidentType.
const incidentFormSchema = z.object({
  incidentType: z.string().min(1, { message: 'Please select an incident type.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  location: z.string().min(1, { message: 'Location is required.' }),
  geolocation: z.string().optional().describe('GPS coordinates (latitude, longitude). Placeholder for auto-capture or manual input.'),
  date: z.date({ required_error: 'Date of incident is required.' }),
  media: z.any().optional(), // Placeholder for file upload
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

interface IncidentFormProps {
  initialData?: Partial<IncidentFormValues>; // For editing existing reports
  onSubmitSuccess?: () => void;
}

export function IncidentForm({ initialData, onSubmitSuccess }: IncidentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]); // Basic state for uploaded files

  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: initialData || {
      incidentType: '',
      description: '',
      location: '',
      geolocation: '',
      date: new Date(),
    },
  });

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMediaFiles(Array.from(event.target.files));
      // TODO: Implement media preview generation here
    }
  };

  async function onSubmit(data: IncidentFormValues) {
    setIsLoading(true);
    console.log('Incident Report Data:', {...data, media: mediaFiles.map(f => f.name) }); // Log file names for now
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: initialData ? 'Report Updated' : 'Report Submitted', // i18n: reportForm.submitSuccessTitle, reportForm.updateSuccessTitle
      description: initialData ? 'The incident report has been successfully updated.' : 'Your incident report has been successfully submitted.', // i18n: reportForm.submitSuccessDesc, reportForm.updateSuccessDesc
      action: <Button variant="outline" size="sm"><Check className="mr-2 h-4 w-4" />OK</Button>,
    });
    setIsLoading(false);
    form.reset(); 
    setMediaFiles([]);
    if (onSubmitSuccess) onSubmitSuccess();
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">
          {initialData ? 'Edit Incident Report' : 'Log New Incident'} {/* i18n: reportForm.editTitle, reportForm.newTitle */}
        </CardTitle>
        <UiFormDescription> {/* Using aliased FormDescription from UI library */}
          {/* i18n: reportForm.description */}
          Please provide detailed information about the incident.
          {/* Placeholder for note on dynamic fields */}
          {/* Note: Fields may dynamically adjust based on the incident type selected (Future AI Integration). */}
        </UiFormDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="incidentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{/* i18n: reportForm.typeLabel */}Incident Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select incident type" />{/* i18n: reportForm.typePlaceholder */}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="near-miss">{/* i18n: reportForm.typeNearMiss */}Near Miss</SelectItem>
                      <SelectItem value="safety-observation">{/* i18n: reportForm.typeSafetyObservation */}Safety Observation</SelectItem>
                      <SelectItem value="first-aid">{/* i18n: reportForm.typeFirstAid */}First Aid</SelectItem>
                      <SelectItem value="property-damage">{/* i18n: reportForm.typePropertyDamage */}Property Damage</SelectItem>
                      <SelectItem value="environmental">{/* i18n: reportForm.typeEnvironmental */}Environmental</SelectItem>
                      <SelectItem value="inspection">{/* i18n: reportForm.typeInspection */}Inspection</SelectItem>
                      <SelectItem value="audit">{/* i18n: reportForm.typeAudit */}Audit</SelectItem>
                      <SelectItem value="dds">{/* i18n: reportForm.typeDDS */}DDS (Diálogo Diário de Segurança)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{/* i18n: reportForm.descriptionLabel */}Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the incident in detail..." /* i18n: reportForm.descriptionPlaceholder */
                      rows={5}
                      {...field}
                      disabled={isLoading}
                      data-ai-hint="incident description details"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground"/>
                      {/* i18n: reportForm.locationLabel */}Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Warehouse Section B" {...field} disabled={isLoading} data-ai-hint="incident location address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-1">{/* i18n: reportForm.dateLabel */}Date of Incident</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{/* i18n: reportForm.datePlaceholder */}Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01") || isLoading
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="geolocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <LocateFixed className="h-4 w-4 mr-2 text-muted-foreground"/>
                    {/* i18n: reportForm.geolocationLabel */}Geolocation (Lat, Long)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., -23.5505, -46.6333 (auto-captured or manual)" {...field} disabled={isLoading} data-ai-hint="latitude longitude coordinates" />
                  </FormControl>
                  <UiFormDescription className="text-xs">
                    {/* i18n: reportForm.geolocationDescription */}
                    GPS coordinates. Will attempt to auto-capture if permission is granted.
                  </UiFormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="flex items-center">
                <CloudUpload className="h-4 w-4 mr-2 text-muted-foreground"/>
                {/* i18n: reportForm.mediaLabel */}Media Upload (Photos, Videos, Audio)
              </FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  multiple 
                  disabled={isLoading} 
                  onChange={handleMediaChange}
                  data-ai-hint="upload photos videos audio" 
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </FormControl>
              {mediaFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm font-medium"> {/* i18n: reportForm.mediaPreviewTitle */}Selected Files ({mediaFiles.length}):</p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground max-h-24 overflow-y-auto">
                    {mediaFiles.map(file => <li key={file.name}>{file.name} ({ (file.size / 1024).toFixed(1) } KB)</li>)}
                  </ul>
                  {/* Placeholder for actual image/video previews */}
                   <div className="mt-1 text-xs text-muted-foreground flex items-center">
                       <ImageIcon className="h-3 w-3 mr-1.5"/> {/* i18n: reportForm.mediaPreviewPlaceholder */}Actual image/video previews will appear here.
                   </div>
                </div>
              )}
              <UiFormDescription className="text-xs">
                {/* i18n: reportForm.mediaDescription */}
                Attach relevant media files. Max 5MB per file. (Functionality for preview and upload processing to be implemented).
              </UiFormDescription>
            </FormItem>

             <FormItem>
              <FormLabel className="flex items-center">
                <Edit3 className="h-4 w-4 mr-2 text-muted-foreground"/>
                {/* i18n: reportForm.signatureLabel */}Signature
              </FormLabel>
              <FormControl>
                {/* TODO: Implement actual signature pad component (e.g., react-signature-canvas) 
                    and consider webcam capture for signature as per wireframe. */}
                <div className="w-full h-32 border border-dashed rounded-md flex items-center justify-center text-muted-foreground bg-muted/50">
                  {/* i18n: reportForm.signaturePlaceholder */}
                  Signature Pad Area (Placeholder for touch/webcam signature)
                </div>
              </FormControl>
            </FormItem>


            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Button type="button" variant="outline" disabled={isLoading}>
                {/* i18n: reportForm.saveDraftButton */}
                Save Draft (Offline Placeholder)
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {/* i18n: reportForm.submittingButton */}
                    Submitting...
                  </>
                ) : (
                  initialData ? 'Update Report' : 'Submit Report' // i18n: reportForm.updateButton, reportForm.submitButton
                )}
              </Button>
            </div>
             <p className="text-xs text-center text-muted-foreground pt-2">
               {/* i18n: reportForm.exportNote */}
               Export options (PDF, PPTX) will be available after submission. (Placeholder for Firestore Functions integration)
             </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
