
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/data/mockData";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ExchangeRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  itemId: string;
  itemName: string;
}

// Define schema for form validation
const exchangeFormSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  image: z.instanceof(File, { message: "Please upload an image" })
});

type ExchangeFormValues = z.infer<typeof exchangeFormSchema>;

const ExchangeRequestDialog = ({
  isOpen,
  onClose,
  recipientId,
  itemId,
  itemName
}: ExchangeRequestDialogProps) => {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<ExchangeFormValues>({
    resolver: zodResolver(exchangeFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
    }
  });
  
  const isSubmitting = form.formState.isSubmitting;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue("image", file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: ExchangeFormValues) => {
    // Simulate API call to submit exchange request
    console.log("Submitting exchange request:", values);
    
    // In a real app, you would send this data to your backend
    setTimeout(() => {
      toast({
        title: "Exchange request sent!",
        description: `Your exchange request for "${itemName}" has been sent to the trader.`,
      });
      resetForm();
      onClose();
    }, 1500);
  };

  const resetForm = () => {
    form.reset();
    setImagePreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Exchange</DialogTitle>
          <DialogDescription>
            Provide details about the item you want to exchange for "{itemName}".
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="What item are you offering?" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectGroup>
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
                  <FormLabel>Item Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your item's condition, age, features, etc."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed information will increase your chances of a successful exchange
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Item Image</FormLabel>
                  <FormControl>
                    <div className="border-2 border-dashed rounded-md p-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Item preview" 
                            className="mx-auto max-h-40 object-contain rounded" 
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={() => {
                              form.resetField("image");
                              setImagePreview(null);
                            }}
                            type="button"
                          >
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="p-2 bg-muted rounded-full">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium">Upload an image of your item</span>
                            <span className="text-xs text-muted-foreground">Accepted formats: JPG, PNG</span>
                          </div>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  onClose();
                }} 
                disabled={isSubmitting}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Exchange Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExchangeRequestDialog;
