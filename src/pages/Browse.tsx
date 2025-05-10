import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ItemCard from "@/components/ItemCard";
import { ItemType } from "@/types/user";
import CategoryFilter from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftRight, HandHeart, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Item {
  post_id: string;
  title: string;
  description: string;
  image: string | null;
  category: string;
  type: ItemType;
  owner_id: string;
  created_at: string;
  seller_id: string;
  price: number;
  product_type: string;
  status: string;
}

const Browse = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category");
  const navigate = useNavigate(); // Thêm useNavigate để chuyển hướng
  
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ItemType | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/items?category=${selectedCategory || ''}&type=${selectedType || ''}&search=${searchQuery}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched items:', data); // Debug
        setItems(data);
      } catch (error) {
        console.error('Error fetching items:', error);
        toast({
          title: "Error",
          description: "Failed to load items.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategory, selectedType, searchQuery]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType ? item.type === selectedType : true;
    
    return matchesCategory && matchesSearch && matchesType;
  });

  // Hàm xử lý khi nhấp vào View
  const handleViewItem = (postId: string) => {
    navigate(`/item-details?post_id=${postId}`); // Chuyển hướng đến /item-details với post_id làm query param
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Items</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-3">Search</h2>
                <div className="relative">
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <CategoryFilter 
                categories={["All", ...new Set(items.map(item => item.category))]} 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory} 
              />
              
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-3">Item Type</h2>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={selectedType === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(null)}
                    className="justify-start"
                  >
                    All Types
                  </Button>
                  <Button
                    variant={selectedType === "Liquidation" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("Liquidation")}
                    className="justify-start"
                  >
                    <DollarSign className="h-4 w-4 mr-2" /> For Sale
                  </Button>
                  <Button
                    variant={selectedType === "Exchange" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("Exchange")}
                    className="justify-start"
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-2" /> For Exchange
                  </Button>
                  <Button
                    variant={selectedType === "Donation" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType("Donation")}
                    className="justify-start"
                  >
                    <HandHeart className="h-4 w-4 mr-2" /> Free Donation
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium">Loading items...</h3>
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.post_id}
                    {...item}
                    onView={() => handleViewItem(item.post_id)} // Truyền hàm handleViewItem
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium">No items found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your filters or search query.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Browse;