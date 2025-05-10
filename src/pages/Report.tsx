import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Report = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    warehouse_item_id: "",
    post_id: "",
    transaction_id: "",
    quantity: "",
    condition: "",
    status: "",
    stored_at: "",
    updated_at: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/warehouse-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          warehouse_item_id: formData.warehouse_item_id || crypto.randomUUID(),
          post_id: formData.post_id,
          transaction_id: formData.transaction_id || crypto.randomUUID(),
          quantity: parseInt(formData.quantity) || 0,
          condition: formData.condition || "Unknown",
          status: formData.status || "Pending",
          stored_at: formData.stored_at || new Date().toISOString(),
          updated_at: formData.updated_at || new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to submit report");

      const result = await response.json();
      toast({
        title: "Success",
        description: "Report submitted successfully!",
      });
      navigate("/browse"); // Chuyển hướng về trang Browse sau khi submit thành công
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Submit Report</h1>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div>
            <Label htmlFor="warehouse_item_id">Warehouse Item ID</Label>
            <Input
              id="warehouse_item_id"
              name="warehouse_item_id"
              value={formData.warehouse_item_id}
              onChange={handleChange}
              placeholder="Enter warehouse item ID or leave blank for auto-generate"
            />
          </div>
          <div>
            <Label htmlFor="post_id">Post ID</Label>
            <Input
              id="post_id"
              name="post_id"
              value={formData.post_id}
              onChange={handleChange}
              placeholder="Enter post ID"
            />
          </div>
          <div>
            <Label htmlFor="transaction_id">Transaction ID</Label>
            <Input
              id="transaction_id"
              name="transaction_id"
              value={formData.transaction_id}
              onChange={handleChange}
              placeholder="Enter transaction ID or leave blank for auto-generate"
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
            />
          </div>
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Input
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              placeholder="Enter condition"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              placeholder="Enter status (e.g., Pending)"
            />
          </div>
          <div>
            <Label htmlFor="stored_at">Stored At</Label>
            <Input
              id="stored_at"
              name="stored_at"
              type="datetime-local"
              value={formData.stored_at}
              onChange={handleChange}
              placeholder="Enter stored date"
            />
          </div>
          <div>
            <Label htmlFor="updated_at">Updated At</Label>
            <Input
              id="updated_at"
              name="updated_at"
              type="datetime-local"
              value={formData.updated_at}
              onChange={handleChange}
              placeholder="Enter updated date"
            />
          </div>
          <Button type="submit">Submit Report</Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Report;