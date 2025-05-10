import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Calendar } from "lucide-react";
import { toast } from "sonner"; // Đảm bảo import này

interface ActivityFormData {
  name: string;
  type: "fundraising" | "donation";
  purpose: string;
  dateStart: string;
  dateEnd: string;
  location: string;
  itemTypes: string;
  target: string;
  image?: FileList;
}

const CreateActivity = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<ActivityFormData>({
    defaultValues: {
      name: "",
      type: "fundraising",
      purpose: "",
      dateStart: "",
      dateEnd: "",
      location: "",
      itemTypes: "",
      target: "",
    },
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("image", e.target.files);
    }
  };
  
const onSubmit = async (data: ActivityFormData) => {
  console.log("Submitting activity form with data:", data); // Debug
  const formDataToSend = new FormData();

  // Ánh xạ các trường từ frontend sang tên trường mà backend yêu cầu
  formDataToSend.append('title', data.name); // Từ name -> title
  formDataToSend.append('activity_type', data.type); // Từ type -> activity_type
  formDataToSend.append('description', data.purpose); // Từ purpose -> description
  formDataToSend.append('start_date', data.dateStart); // Từ dateStart -> start_date
  formDataToSend.append('end_date', data.dateEnd); // Từ dateEnd -> end_date
  formDataToSend.append('location', data.location);
  formDataToSend.append('goal_amount', data.target || '0'); // Từ target -> goal_amount
  formDataToSend.append('amount_raised', '0'); // Mặc định amount_raised là 0

  // Nếu là donation, có thể thêm thông tin itemTypes vào description hoặc một trường khác
  if (data.type === 'donation') {
    formDataToSend.set('description', `${data.purpose}\nItem Types: ${data.itemTypes}`);
  }

  if (data.image && data.image[0]) {
    formDataToSend.append('image', data.image[0]);
  }

  try {
    const response = await fetch('http://localhost:5000/api/activities', {
      method: 'POST',
      body: formDataToSend,
    });
    const result = await response.json();
    console.log("API response:", result); // Debug

    if (response.ok) {
      toast.success("Activity Submitted", {
        description: "Your activity has been submitted for approval.",
      });
      setTimeout(() => {
        navigate("/fundraisers");
      }, 1500);
      form.reset();
      setImagePreview(null);
    } else {
      toast.error("Error", {
        description: result.error || "Failed to submit activity.",
      });
    }
  } catch (err) {
    console.error("Submission error:", err);
    toast.error("Error", {
      description: "An unexpected error occurred.",
    });
  }
};
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create a Fundraising/Donation Activity</h1>
          <p className="text-muted-foreground mb-6">
            Fill out this form to start a new fundraising or donation activity for your school. 
            All activities require approval before being published.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Activity name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a clear, descriptive name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Choose a name that clearly describes your activity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                rules={{ required: "Activity type is required" }}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Activity Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fundraising" id="fundraising" />
                          <FormLabel htmlFor="fundraising" className="font-normal cursor-pointer">
                            Fundraising - Collect money for a specific cause
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="donation" id="donation" />
                          <FormLabel htmlFor="donation" className="font-normal cursor-pointer">
                            Donation - Collect physical items for a cause
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="purpose"
                rules={{ required: "Purpose description is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what this activity is for and who it will benefit" 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Be specific about how funds or donations will be used
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dateStart"
                  rules={{ required: "Start date is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="date" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateEnd"
                  rules={{ 
                    required: "End date is required",
                    validate: value => {
                      const start = form.getValues("dateStart");
                      return !start || new Date(value) >= new Date(start) || "End date must be after start date";
                    }  
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="date" 
                            className="pl-10" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Image</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                        {imagePreview ? (
                          <div className="mb-4">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="max-h-48 rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-4">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SVG, PNG, JPG (max. 2MB)
                            </p>
                          </div>
                        )}
                        <Input
                          type="file"
                          accept="image/*"
                          className="mt-2"
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(e.target.files);
                              handleImageChange(e);
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Upload an image that represents your activity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                rules={{ required: "Location is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Where will this activity take place?" {...field} />
                    </FormControl>
                    <FormDescription>
                      Specify where donations can be dropped off or events will be held
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("type") === "donation" ? (
                <FormField
                  control={form.control}
                  name="itemTypes"
                  rules={{ required: "Item types are required for donations" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Types of Items Needed</FormLabel>
                      <FormControl>
                        <Input placeholder="Books, clothing, school supplies, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        List the types of items you're collecting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="target"
                  rules={{ required: "Fundraising target is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fundraising Target ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" min="1" step="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Set a realistic fundraising goal amount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="pt-4">
                <Button type="submit" className="w-full">Submit Activity for Review</Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Your activity will be reviewed by an administrator before being published
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateActivity;