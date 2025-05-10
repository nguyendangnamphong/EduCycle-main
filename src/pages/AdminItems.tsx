import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Search, CheckCircle, XCircle, Image, DollarSign, ArrowLeftRight, HandHeart } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import { ItemType } from "@/types/user";

interface AdminItemProps {
  id: string;
  post_id: string;
  title: string;
  description: string;
  price?: number;
  image: string;
  category: string;
  type: ItemType;
  product_type: string;
  seller: string;
  seller_id: string;
  status: 'pending' | 'approved' | 'rejected';
  dateSubmitted: string;
}

// Define manual pending items with correct status type
const manualPendingItems: AdminItemProps[] = [
  // {
  //   id: `ITEM-PEND-1`,
  //   post_id: `ITEM-PEND-1`,
  //   title: `New Item Pending Approval 1`,
  //   description: "This item is awaiting moderation approval before being listed on the site.",
  //   price: 10,
  //   image: "https://placehold.co/300x200",
  //   category: "Books",
  //   type: "Liquidation" as ItemType,
  //   product_type: "Books",
  //   seller: "New User",
  //   seller_id: `new-user-0`,
  //   status: 'pending', // Explicitly set as 'pending'
  //   dateSubmitted: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString(),
  // },
  // {
  //   id: `ITEM-PEND-2`,
  //   post_id: `ITEM-PEND-2`,
  //   title: `New Item Pending Approval 2`,
  //   description: "This item is awaiting moderation approval before being listed on the site.",
  //   price: 20,
  //   image: "https://placehold.co/300x200",
  //   category: "Supplies",
  //   type: "Exchange" as ItemType,
  //   product_type: "Supplies",
  //   seller: "New User",
  //   seller_id: `new-user-1`,
  //   status: 'pending',
  //   dateSubmitted: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString(),
  // },
  // {
  //   id: `ITEM-PEND-3`,
  //   post_id: `ITEM-PEND-3`,
  //   title: `New Item Pending Approval 3`,
  //   description: "This item is awaiting moderation approval before being listed on the site.",
  //   price: 30,
  //   image: "https://placehold.co/300x200",
  //   category: "Electronics",
  //   type: "Donation" as ItemType,
  //   product_type: "Electronics",
  //   seller: "New User",
  //   seller_id: `new-user-2`,
  //   status: 'pending',
  //   dateSubmitted: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString(),
  // },
  // {
  //   id: `ITEM-PEND-4`,
  //   post_id: `ITEM-PEND-4`,
  //   title: `New Item Pending Approval 4`,
  //   description: "This item is awaiting moderation approval before being listed on the site.",
  //   price: 40,
  //   image: "https://placehold.co/300x200",
  //   category: "Clothing",
  //   type: "Liquidation" as ItemType,
  //   product_type: "Clothing",
  //   seller: "New User",
  //   seller_id: `new-user-3`,
  //   status: 'pending',
  //   dateSubmitted: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString(),
  // },
  // {
  //   id: `ITEM-PEND-5`,
  //   post_id: `ITEM-PEND-5`,
  //   title: `New Item Pending Approval 5`,
  //   description: "This item is awaiting moderation approval before being listed on the site.",
  //   price: 50,
  //   image: "https://placehold.co/300x200",
  //   category: "Other",
  //   type: "Exchange" as ItemType,
  //   product_type: "Other",
  //   seller: "New User",
  //   seller_id: `new-user-4`,
  //   status: 'pending',
  //   dateSubmitted: new Date(Date.now() - Math.floor(Math.random() * 3) * 24 * 60 * 60 * 1000).toISOString(),
  // },
];

// Fetch data from backend and combine with manual pending items
const AdminItems = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminItemProps[]>(manualPendingItems); // Start with manual items
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<AdminItemProps | null>(null);
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | "view" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch initial items from backend on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/items');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data from /api/admin/items:', data); // Debug log

        // Map data to ensure status is of correct type
        const mappedData: AdminItemProps[] = data.map(item => ({
          id: item.id,
          post_id: item.post_id,
          title: item.title,
          description: item.description,
          price: item.price,
          image: item.image,
          category: item.category,
          type: item.type as ItemType,
          product_type: item.product_type,
          seller: item.seller,
          seller_id: item.seller_id,
          status: item.status === 'pending' || item.status === 'approved' || item.status === 'rejected' 
            ? item.status 
            : 'pending', // Default to 'pending' if status is invalid
          dateSubmitted: item.dateSubmitted,
        }));

        // Combine manual items first, then database items
        const combinedItems = [...manualPendingItems, ...mappedData];
        setItems(combinedItems);
      } catch (error) {
        console.error('Error fetching items:', error); // Debug log
        toast({
          title: "Error",
          description: `Failed to load items from database. Using manual items only. Error: ${error.message}`,
          variant: "destructive",
        });
        // Keep manual items if fetch fails
        setItems(manualPendingItems);
      }
    };
    fetchItems();
  }, [toast]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const searchMatch = 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeMatch = filterType ? item.type === filterType : true;
    const statusMatch = filterStatus ? item.status === filterStatus : true;
    
    return searchMatch && typeMatch && statusMatch;
  });

  // Get type icon
  const getTypeIcon = (type: ItemType) => {
    switch (type) {
      case "Liquidation":
        return <DollarSign className="h-4 w-4" />;
      case "Exchange":
        return <ArrowLeftRight className="h-4 w-4" />;
      case "Donation":
        return <HandHeart className="h-4 w-4" />;
    }
  };

  // Get type text
  const getTypeText = (type: ItemType) => {
    switch (type) {
      case "Liquidation":
        return "For Sale";
      case "Exchange":
        return "For Exchange";
      case "Donation":
        return "Free Donation";
    }
  };

  // Action handlers
  const openApprovalDialog = (item: AdminItemProps) => {
    setSelectedItem(item);
    setDialogAction("approve");
    setDialogOpen(true);
  };

  const openRejectDialog = (item: AdminItemProps) => {
    setSelectedItem(item);
    setDialogAction("reject");
    setDialogOpen(true);
  };

  const openViewDialog = (item: AdminItemProps) => {
    setSelectedItem(item);
    setDialogAction("view");
    setDialogOpen(true);
  };

  const executeAction = async () => {
    if (!selectedItem || !dialogAction) return;

    try {
      if (dialogAction === "approve") {
        // Chỉ xử lý item từ database, bỏ qua manual items
        if (!selectedItem.post_id.startsWith('ITEM-PEND-')) {
          const response = await fetch(`http://localhost:5000/api/admin/approve/${selectedItem.post_id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              item_id: selectedItem.post_id,
              item_name: selectedItem.title,
              description: selectedItem.description,
              image_url: selectedItem.image,
              category_id: selectedItem.category,
              create_at: selectedItem.dateSubmitted,
            }),
          });
          const result = await response.json();
          if (response.ok) {
            setItems(items.map(item => 
              item.id === selectedItem.id ? { ...item, status: "approved" } : item
            ));
            toast({
              title: "Item Approved",
              description: `${selectedItem.title} has been approved and is now live.`,
            });
          } else {
            throw new Error(result.error || "Failed to approve item");
          }
        } else {
          // Manual items chỉ thay đổi trạng thái trong frontend
          setItems(items.map(item => 
            item.id === selectedItem.id ? { ...item, status: "approved" } : item
          ));
          toast({
            title: "Item Approved",
            description: `${selectedItem.title} has been approved (manual item).`,
          });
        }
      } else if (dialogAction === "reject") {
        // Chỉ xóa item từ database, bỏ qua manual items
        if (!selectedItem.post_id.startsWith('ITEM-PEND-')) {
          const response = await fetch(`http://localhost:5000/api/admin/reject/${selectedItem.post_id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            setItems(items.filter(item => item.id !== selectedItem.id));
            toast({
              title: "Item Rejected",
              description: `${selectedItem.title} has been rejected.`,
            });
          } else {
            throw new Error("Failed to reject item");
          }
        } else {
          // Manual items chỉ xóa khỏi danh sách frontend
          setItems(items.filter(item => item.id !== selectedItem.id));
          toast({
            title: "Item Rejected",
            description: `${selectedItem.title} has been rejected (manual item).`,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setDialogOpen(false);
      setSelectedItem(null);
      setDialogAction(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <div className="container py-8 flex-1">
        <div className="flex">
          <AdminSidebar />
          
          <div className="flex-1 ml-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Item Listings Management</h1>
            </div>
            
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by ID, title, or seller..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              
              <div>
                <select 
                  className="w-full h-10 rounded-md border border-input px-3 py-2"
                  onChange={(e) => setFilterType(e.target.value || null)}
                >
                  <option value="">All Types</option>
                  <option value="Liquidation">For Sale</option>
                  <option value="Exchange">For Exchange</option>
                  <option value="Donation">Donation</option>
                </select>
              </div>
              
              <div>
                <select 
                  className="w-full h-10 rounded-md border border-input px-3 py-2"
                  onChange={(e) => setFilterStatus(e.target.value || null)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-32">
                        No items found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.title} 
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Image className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium truncate max-w-[200px]">{item.title}</div>
                              {item.type === "Liquidation" && item.price && (
                                <div className="text-xs text-muted-foreground">${item.price.toFixed(2)}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(item.type)}
                            <span>{getTypeText(item.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.seller}</TableCell>
                        <TableCell>
                          {new Date(item.dateSubmitted).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'approved' ? 'bg-educycle-green/10 text-educycle-green' :
                            item.status === 'pending' ? 'bg-educycle-yellow/10 text-educycle-yellow' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {item.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-educycle-green hover:bg-educycle-green/10"
                                  onClick={() => openApprovalDialog(item)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-destructive hover:bg-destructive/10"
                                  onClick={() => openRejectDialog(item)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openViewDialog(item)}
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Showing {filteredItems.length} of {items.length} items
              </div>
              <div>
                Page 1 of 1
              </div>
            </div>
            
            {/* Stats Summary */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4">
                <div className="text-lg font-medium">Total Items</div>
                <div className="text-3xl font-bold mt-1">{items.length}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-lg font-medium">Pending Review</div>
                <div className="text-3xl font-bold mt-1 text-educycle-yellow">
                  {items.filter(item => item.status === 'pending').length}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-lg font-medium">Active Listings</div>
                <div className="text-3xl font-bold mt-1 text-educycle-green">
                  {items.filter(item => item.status === 'approved').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === "approve" ? "Approve Item" : 
               dialogAction === "reject" ? "Reject Item" :
               "Item Details"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === "approve" ? 
                `Are you sure you want to approve "${selectedItem?.title}"? This will make it visible to all users.` : 
               dialogAction === "reject" ? 
                `Are you sure you want to reject "${selectedItem?.title}"? You may provide a reason for rejection.` :
                `Details for ${selectedItem?.title}`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {dialogAction === "view" && selectedItem && (
            <div className="py-4">
              <div className="overflow-hidden rounded-md mb-4">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.title}
                  className="w-full h-48 object-cover"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <div className="flex items-center gap-1">
                    {getTypeIcon(selectedItem.type)}
                    <p className="capitalize">{getTypeText(selectedItem.type)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p>{selectedItem.type === "Liquidation" && selectedItem.price ? `$${selectedItem.price.toFixed(2)}` : "N/A"}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p>{selectedItem.category}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Seller</p>
                  <p>{selectedItem.seller}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>
              </div>
            </div>
          )}
          
          {dialogAction === "reject" && (
            <div className="py-4">
              <label className="text-sm font-medium">Reason for rejection</label>
              <textarea 
                className="w-full mt-2 p-3 border rounded-md h-24"
                placeholder="Please provide a reason for rejecting this item"
              />
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            {dialogAction === "view" ? (
              <AlertDialogAction onClick={() => setDialogOpen(false)}>
                Close
              </AlertDialogAction>
            ) : (
              <AlertDialogAction 
                onClick={executeAction}
                className={dialogAction === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}
              >
                {dialogAction === "approve" ? "Approve Item" : "Reject Item"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
};

export default AdminItems;