
import { useState } from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, DollarSign, HandHeart, MessageCircle, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ExchangeRequestDialog from "@/components/ExchangeRequestDialog";

// Mock item data (in a real app, you would fetch this from your API)
const mockItem = {
  post_id: "item123",
  seller_id: "user456",
  title: "TI-84 Plus Graphing Calculator",
  description: "Slightly used TI-84 Plus graphing calculator in excellent condition. Perfect for high school or college students taking math, science, or engineering courses. Includes fresh batteries and manual.",
  price: 75.99,
  type: "Liquidation",
  product_type: "Electronics",
  status: "Approved",
  seller: "Jane Smith",
  image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
  category: "Electronics",
};

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [showExchangeDialog, setShowExchangeDialog] = useState(false);

  // In a real app, you would fetch the item details based on the ID
  const item = mockItem;
  const isExchangeItem = item.type === "Exchange";
  const isDonationItem = item.type === "Donation";
  const isSaleItem = item.type === "Liquidation";

  const handleBuyNow = () => {
    toast({
      title: "Purchase initiated",
      description: "You are being redirected to complete your purchase.",
    });
  };

  const handleContactSeller = () => {
    toast({
      title: "Message sent",
      description: `Your message has been sent to ${item.seller}.`,
    });
  };

  const handleReportItem = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep EduCycle safe.",
    });
  };

  const handleRequestDonation = () => {
    toast({
      title: "Request submitted",
      description: "Your request for this donation has been submitted.",
    });
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case "Liquidation":
        return <DollarSign className="h-4 w-4" />;
      case "Exchange":
        return <ArrowLeftRight className="h-4 w-4" />;
      case "Donation":
        return <HandHeart className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeText = () => {
    switch (item.type) {
      case "Liquidation":
        return "For Sale";
      case "Exchange":
        return "For Exchange";
      case "Donation":
        return "Free Donation";
      default:
        return item.type;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case "Liquidation":
        return "bg-educycle-blue text-white";
      case "Exchange":
        return "bg-educycle-yellow text-black";
      case "Donation":
        return "bg-educycle-green text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column - Item image */}
          <div>
            <div className="rounded-lg overflow-hidden">
              <img 
                src={item.image || "/placeholder.svg"} 
                alt={item.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Right column - Item details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor()}>
                  <span className="flex items-center gap-1">
                    {getTypeIcon()}
                    {getTypeText()}
                  </span>
                </Badge>
                <Badge variant="outline">{item.status}</Badge>
              </div>
              <h1 className="text-3xl font-bold mt-2">{item.title}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span>Category: {item.category}</span>
                <span>•</span>
                <span>Type: {item.product_type}</span>
              </div>
            </div>

            {isSaleItem && (
              <div className="text-3xl font-bold">${item.price.toFixed(2)}</div>
            )}

            <div>
              <h2 className="font-medium mb-2">Description</h2>
              <p className="text-muted-foreground">{item.description}</p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                    {item.seller.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium">{item.seller}</h3>
                    <p className="text-sm text-muted-foreground">Seller</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {isSaleItem && item.status === "Approved" && (
                <Button className="w-full" onClick={handleBuyNow}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
              )}

              {isExchangeItem && (
                <Button className="w-full" onClick={() => setShowExchangeDialog(true)}>
                  <ArrowLeftRight className="h-4 w-4 mr-2" />
                  Request Exchange
                </Button>
              )}

              {isDonationItem && (
                <Button className="w-full" onClick={handleRequestDonation}>
                  <HandHeart className="h-4 w-4 mr-2" />
                  Request Donation
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleContactSeller}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Seller
                </Button>
                <Button variant="outline" onClick={handleReportItem}>
                  <Flag className="h-4 w-4 mr-2" />
                  Report Item
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>

      <ExchangeRequestDialog
        isOpen={showExchangeDialog}
        onClose={() => setShowExchangeDialog(false)}
        recipientId={item.seller_id}
        itemId={item.post_id}
        itemName={item.title}
      />
    </div>
  );
};

export default ItemDetails;
