
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FundraiserCard from "@/components/FundraiserCard";
import { mockFundraisers } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { HandHeart, ShoppingCart } from "lucide-react";
import { FundraiserType } from "@/types/user";

const Fundraisers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FundraiserType | "all">("all");
  
  const filteredFundraisers = mockFundraisers.filter((fundraiser) => {
    const matchesSearch = 
      fundraiser.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      fundraiser.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fundraiser.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || fundraiser.fundraiserType === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">School Fundraisers</h1>
            <p className="text-muted-foreground mt-1">Support important causes at our school</p>
          </div>
          
          <div className="w-full md:w-auto">
            <Input
              placeholder="Search fundraisers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
        </div>
        
        {/* Banner/CTA for starting a fundraiser */}
        <div className="bg-educycle-blue/10 rounded-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-medium">Have a cause you care about?</h2>
            <p className="text-muted-foreground">Teachers and student clubs can start fundraising campaigns.</p>
          </div>
          <Link to="/create-activity">
            <Button>Start a Fundraiser</Button>
          </Link>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={typeFilter === "all" ? "default" : "outline"} 
            onClick={() => setTypeFilter("all")}
          >
            All Fundraisers
          </Button>
          <Button 
            variant={typeFilter === "ItemDonation" ? "default" : "outline"}
            onClick={() => setTypeFilter("ItemDonation")}
            className="flex items-center gap-2"
          >
            <HandHeart className="h-4 w-4" />
            Item Donations
          </Button>
          <Button 
            variant={typeFilter === "ItemSale" ? "default" : "outline"}
            onClick={() => setTypeFilter("ItemSale")}
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Purchase Items
          </Button>
        </div>
        
        {filteredFundraisers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFundraisers.map((fundraiser) => (
              <div key={fundraiser.id}>
                <FundraiserCard 
                  id={fundraiser.id}
                  title={fundraiser.title}
                  description={fundraiser.description}
                  goalAmount={fundraiser.goalAmount} 
                  amountRaised={fundraiser.amountRaised}
                  image={fundraiser.image}
                  organizer={fundraiser.organizer}
                  endDate={fundraiser.endDate}
                  participants={fundraiser.participants}
                  fundraiserType={fundraiser.fundraiserType}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium">No fundraisers found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Fundraisers;
