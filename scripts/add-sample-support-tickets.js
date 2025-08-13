// Script to add sample support tickets for testing the Customer Messages page
// Run this in browser console on the admin dashboard page

const sampleTickets = [
  {
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+972-50-123-4567",
    message:
      "Hi! I'm interested in your color tracking system. Can you tell me more about the pricing for a medium-sized salon?",
    source_page: "chat",
  },
  {
    name: "Michael Chen",
    email: "mike.chen@beautyworks.com",
    phone: "+972-54-987-6543",
    message:
      "Hello, I saw your WhatsApp button and wanted to ask about installation process. How long does it take?",
    source_page: "whatsapp",
  },
  {
    name: "Emma Rodriguez",
    email: "emma.r@hairdesign.co.il",
    phone: "+972-52-555-1234",
    message:
      "We're considering your system for our 3 locations. Do you offer bulk pricing?",
    source_page: "/",
  },
];

async function addSampleTickets() {
  console.log("🎫 Adding sample support tickets...");

  for (const ticket of sampleTickets) {
    try {
      const response = await fetch("/.netlify/functions/support-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticket),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Added ticket: ${ticket.name} - ${ticket.email}`);
      } else {
        console.log(
          `❌ Failed to add ticket for ${ticket.email}: ${response.status}`,
        );
      }
    } catch (error) {
      console.log(`❌ Error adding ticket for ${ticket.email}:`, error);
    }
  }

  console.log("🎉 Sample tickets added! Refresh the page to see them.");
}

// Run the function
addSampleTickets();
