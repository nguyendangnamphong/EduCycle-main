import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, DollarSign, ArrowLeftRight, HandHeart } from "lucide-react";
import { categories } from "@/data/mockData";
import { toast } from "sonner";

const Sell = () => {
  const [itemType, setItemType] = useState<"sale" | "exchange" | "donation">("sale");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exchangePreferences, setExchangePreferences] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    post_id: crypto.randomUUID(),
    seller_id: "user1",
    item_id: crypto.randomUUID(),
    title: "",
    description: "",
    price: 0,
    type: "Sell",
    product_type: "",
    category_id: "",
    status: "Pending",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category_id: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const previews = Array.from(files).map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataToSend = new FormData();
    dataToSend.append('post_id', formData.post_id);
    dataToSend.append('seller_id', formData.seller_id);
    dataToSend.append('item_id', formData.item_id);
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    dataToSend.append('price', formData.price.toString());
    dataToSend.append('type', itemType === 'sale' ? 'Sell' : itemType === 'exchange' ? 'Exchange' : 'Donation');
    dataToSend.append('product_type', itemType === 'donation' ? 'Donation' : formData.product_type || 'General');
    dataToSend.append('category_id', formData.category_id);
    dataToSend.append('status', formData.status);
    if (itemType === 'exchange') {
      dataToSend.append('exchange_preferences', exchangePreferences);
    }

    const imageInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (imageInput && imageInput.files) {
      Array.from(imageInput.files).forEach(file => {
        dataToSend.append('images', file);
      });
    }

    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        body: dataToSend,
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Listing submitted successfully!", {
          description: "Your item is now pending review and will be published soon.",
        });
        setFormData({
          post_id: crypto.randomUUID(),
          seller_id: "user1",
          item_id: crypto.randomUUID(),
          title: "",
          description: "",
          price: 0,
          type: "Sell",
          product_type: "",
          category_id: "",
          status: "Pending",
        });
        setExchangePreferences("");
        setImagePreviews([]);
      } else {
        toast.error("Error", {
          description: result.error || "Failed to submit listing.",
        });
      }
    } catch (err) {
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create a New Listing</h1>
          <p className="text-muted-foreground mb-6">Fill out the form below to list your item.</p>
          
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>
                Provide clear information about your item to help others find it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="listing-type">Listing Type</Label>
                    <RadioGroup 
                      defaultValue="sale" 
                      value={itemType}
                      onValueChange={(value) => setItemType(value as "sale" | "exchange" | "donation")}
                      className="flex flex-col sm:flex-row gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sale" id="sale" />
                        <Label htmlFor="sale" className="flex items-center gap-1 cursor-pointer">
                          <DollarSign className="h-4 w-4" /> For Sale
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exchange" id="exchange" />
                        <Label htmlFor="exchange" className="flex items-center gap-1 cursor-pointer">
                          <ArrowLeftRight className="h-4 w-4" /> For Exchange
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="donation" id="donation" />
                        <Label htmlFor="donation" className="flex items-center gap-1 cursor-pointer">
                          <HandHeart className="h-4 w-4" /> Free Donation
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange} 
                      placeholder="Give your listing a clear title" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={handleCategoryChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
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
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      placeholder="Describe your item in detail (condition, features, etc.)" 
                      rows={5}
                      required
                    />
                  </div>
                  
                  {itemType === "sale" && (
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input 
                        id="price" 
                        name="price" 
                        type="number" 
                        min="0.01" 
                        step="0.01" 
                        value={formData.price} 
                        onChange={handleChange} 
                        placeholder="0.00"
                        required 
                      />
                    </div>
                  )}

                  {itemType === "exchange" && (
                    <div>
                      <Label htmlFor="exchange-preferences">Exchange Preferences</Label>
                      <Textarea
                        id="exchange-preferences"
                        placeholder="What are you looking to exchange this item for? List specific items or categories you're interested in."
                        rows={3}
                        value={exchangePreferences}
                        onChange={(e) => setExchangePreferences(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Be specific about what you're willing to trade for. This helps potential exchangers know if their items match your interests.
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <Label>Photos</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center bg-muted/50">
                      {imagePreviews.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {imagePreviews.map((preview, index) => (
                            <img key={index} src={preview} alt={`Preview ${index}`} className="h-24 w-24 object-cover rounded" />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Drag photos here or click to upload</p>
                          <p className="text-xs text-muted-foreground mt-1">Upload up to 5 photos (PNG, JPG)</p>
                        </div>
                      )}
                      <Input 
                        id="image-upload" 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="mt-2"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit for Review"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    All listings are subject to review before being published.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Sell;