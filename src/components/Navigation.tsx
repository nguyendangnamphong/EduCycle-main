import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, LogIn, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link to="/home" className="flex items-center">
            <span className="text-2xl font-bold text-educycle-green">
              Edu<span className="text-educycle-blue">Cycle</span>
            </span>
          </Link>
        </div>

        <div className="hidden flex-1 max-w-md mx-8 lg:block">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for items..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/browse">
            <Button variant="ghost" size="sm">
              Browse
            </Button>
          </Link>
          <Link to="/fundraisers">
            <Button variant="ghost" size="sm">
              Fundraisers
            </Button>
          </Link>
          <Link to="/sell">
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Sell Item
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="icon">
              <LogIn className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;