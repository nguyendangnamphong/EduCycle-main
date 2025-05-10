import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, DollarSign, HandHeart } from "lucide-react";
import type { ItemType } from "@/types/user";

export interface ItemCardProps {
  post_id: string;
  title: string;
  description: string;
  price?: number;
  type: ItemType;
  product_type?: string;
  status?: string;
  image: string | null;
  seller_id?: string;
  owner_id?: string;
  created_at?: string;
  id?: string;
  onView: () => void; // Thêm prop onView
}

const ItemCard = ({ post_id, title, description, price, type, product_type, status, image, id = post_id, onView }: ItemCardProps) => {
  const getTypeIcon = () => {
    switch (type) {
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

  const getTypeColor = () => {
    switch (type) {
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

  const getTypeText = () => {
    switch (type) {
      case "Liquidation":
        return "For Sale";
      case "Exchange":
        return "For Exchange";
      case "Donation":
        return "Free Donation";
      default:
        return "Unknown Type";
    }
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image || "/placeholder.svg"} 
          alt={title} 
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute bottom-2 left-2">
          <Badge className={getTypeColor()}>
            <span className="flex items-center gap-1">
              {getTypeIcon()}
              {getTypeText()}
            </span>
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1 text-lg">{title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {product_type || 'Unknown'} • {status || 'Unknown'}
            </CardDescription>
          </div>
          {type === "Liquidation" && price && (
            <span className="font-bold text-lg">${price.toFixed(2)}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button onClick={onView} variant="outline" size="sm">View Details</Button>
        {type === "Liquidation" && status === "Approved" && (
          <Button size="sm">Buy Now</Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ItemCard;
export type { ItemType };