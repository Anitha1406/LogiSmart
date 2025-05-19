import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Loader2 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Account settings form schema
const accountSettingsSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters" }),
  password: z.string().optional(),
});

type AccountSettingsValues = z.infer<typeof accountSettingsSchema>;

// Prediction settings form schema
const predictionSettingsSchema = z.object({
  enableAutomatedPredictions: z.boolean().default(true),
  predictionInterval: z.string(),
  historicalDataRange: z.string(),
  confidenceThreshold: z.string(),
});

type PredictionSettingsValues = z.infer<typeof predictionSettingsSchema>;

// Interface settings form schema
const interfaceSettingsSchema = z.object({
  darkMode: z.boolean().default(false),
  theme: z.string(),
  dateFormat: z.string(),
  enableNotifications: z.boolean().default(true),
});

type InterfaceSettingsValues = z.infer<typeof interfaceSettingsSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingPrediction, setIsSavingPrediction] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);

  // Initialize account settings form
  const accountForm = useForm<AccountSettingsValues>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      email: user?.email || "",
      displayName: user?.displayName || "",
      password: "",
    },
  });

  // Initialize prediction settings form
  const predictionForm = useForm<PredictionSettingsValues>({
    resolver: zodResolver(predictionSettingsSchema),
    defaultValues: {
      enableAutomatedPredictions: true,
      predictionInterval: "weekly",
      historicalDataRange: "6-months",
      confidenceThreshold: "75",
    },
  });

  // Initialize interface settings form
  const interfaceForm = useForm<InterfaceSettingsValues>({
    resolver: zodResolver(interfaceSettingsSchema),
    defaultValues: {
      darkMode: theme === "dark",
      theme: "blue",
      dateFormat: "MM/DD/YYYY",
      enableNotifications: true,
    },
  });

  // Handle account settings form submission
  const onAccountSubmit = async (data: AccountSettingsValues) => {
    setIsSavingAccount(true);
    try {
      // Would update user account settings here with Firebase
      toast({
        title: "Account Settings Updated",
        description: "Your account settings have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update account settings.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Handle prediction settings form submission
  const onPredictionSubmit = async (data: PredictionSettingsValues) => {
    setIsSavingPrediction(true);
    try {
      // Would update prediction settings here
      toast({
        title: "Prediction Settings Updated",
        description: "Your prediction settings have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update prediction settings.",
        variant: "destructive",
      });
    } finally {
      setIsSavingPrediction(false);
    }
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    setTheme(checked ? "dark" : "light");
  };

  // Handle data export
  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Mock export functionality
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent("Inventory data export"));
      element.setAttribute("download", "logismart_inventory.json");
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setIsExporting(false);
      toast({
        title: "Data Exported",
        description: "Your inventory data has been exported successfully."
      });
    }, 1000);
  };

  // Handle data import
  const handleImportData = () => {
    setIsImporting(true);
    // Mock import functionality
    setTimeout(() => {
      setIsImporting(false);
      toast({
        title: "Data Imported",
        description: "Your inventory data has been imported successfully."
      });
    }, 1000);
  };

  // Handle model retraining
  const handleRetrainModel = () => {
    setIsRetraining(true);
    // Mock retraining functionality
    setTimeout(() => {
      setIsRetraining(false);
      toast({
        title: "Model Retrained",
        description: "The prediction model has been retrained with the latest data."
      });
    }, 2000);
  };

  // Handle data clear
  const handleClearData = () => {
    toast({
      title: "Data Cleared",
      description: "All your data has been cleared from the system."
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Account Settings */}
          <Card className="mb-6">
            <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-medium">Account Settings</CardTitle>
            </CardHeader>
            <Form {...accountForm}>
              <form onSubmit={accountForm.handleSubmit(onAccountSubmit)}>
                <CardContent className="p-6 space-y-4">
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={accountForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Leave blank to keep your current password
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="px-6 py-4 flex justify-end">
                  <Button type="submit" disabled={isSavingAccount}>
                    {isSavingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>

          {/* Prediction Settings */}
          <Card>
            <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-medium">Prediction Settings</CardTitle>
            </CardHeader>
            <Form {...predictionForm}>
              <form onSubmit={predictionForm.handleSubmit(onPredictionSubmit)}>
                <CardContent className="p-6 space-y-4">
                  <FormField
                    control={predictionForm.control}
                    name="enableAutomatedPredictions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Automated Demand Predictions</FormLabel>
                          <FormDescription>
                            Enable AI-driven demand forecasting
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={predictionForm.control}
                    name="predictionInterval"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prediction Interval</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How often predictions should be updated
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={predictionForm.control}
                    name="historicalDataRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Historical Data Range</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-month">Last month</SelectItem>
                            <SelectItem value="3-months">Last 3 months</SelectItem>
                            <SelectItem value="6-months">Last 6 months</SelectItem>
                            <SelectItem value="1-year">Last year</SelectItem>
                            <SelectItem value="all">All available data</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={predictionForm.control}
                    name="confidenceThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Confidence Threshold</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select threshold" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="60">60%</SelectItem>
                            <SelectItem value="70">70%</SelectItem>
                            <SelectItem value="75">75%</SelectItem>
                            <SelectItem value="80">80%</SelectItem>
                            <SelectItem value="90">90%</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Minimum confidence level for predictions to be shown
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="px-6 py-4 flex justify-end">
                  <Button type="submit" disabled={isSavingPrediction}>
                    {isSavingPrediction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Interface Settings */}
          <Card>
            <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-medium">Interface Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dark Mode</span>
                <Switch 
                  checked={isDarkMode} 
                  onCheckedChange={handleDarkModeToggle} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Theme Color</label>
                <Select defaultValue="blue">
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue (Default)</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Format</label>
                <Select defaultValue="MM/DD/YYYY">
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="notifications" defaultChecked />
                <label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
                  Enable desktop notifications
                </label>
              </div>
            </CardContent>
          </Card>
          
          {/* Data Management */}
          <Card>
            <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-medium">Data Management</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <Button 
                  variant="outline" 
                  className="justify-start" 
                  onClick={handleExportData}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  <span>Export Inventory Data</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={handleImportData}
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  <span>Import Inventory Data</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={handleRetrainModel}
                  disabled={isRetraining}
                >
                  {isRetraining ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  <span>Retrain Prediction Model</span>
                </Button>
                
                <Separator className="my-2" />
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="justify-start text-red-500 border-red-300 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Clear All Data</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all your
                        inventory data and reset your account to default settings.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearData}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Clear All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
