// "use client";
// import {
//   FaArrowLeft
// } from "react-icons/fa";
// import Link from "next/link";
// import { IMAGES } from "@/constants/image";
// import CustomerInfo from "@/components/customerInfo";
// import { useState } from "react";
// import OrderStatusDropdown from "../../upholstery/[upholsteryId]/components/orderStatus";
// import VendorModal from "../../upholstery/[upholsteryId]/components/assignVendorModal";

// export default function Page() {
//   // Data as array of objects for dynamic rendering
//   const order = {
//     customer: {
//       name: "Nike",
//       email: "emily@domain.com",
//       phone: "+12345-678910",
//       address: "1234 Maple Street, Canada",
//       country: "Canada",
//       avatar: IMAGES.avatar,
//     },
//     status: "Pending",
//     type: "Consultation",
//     datetime: "05/05 - 05:45 PM",
//   };
//   const [showVendorModal, setShowVendorModal] = useState(false);
//   const [status, setStatus] = useState(order.status);

//   // Array for grid data
//   const orderDetails = [
//     {
//       label: "Memory Foam",
//       value: "Pillow Type",
//       icon: null,
//     },
//     {
//       label: "Cotton Blend",
//       value: "Seating Type",
//       icon: null,
//     },
//     {
//       label: "Fabric Features",
//       value: "Cabinet Type",
//       icon: null,
//     },
//     {
//       label: "Dimensions",
//       value: "10L",
//       icon: null,
//     },
//     {
//       label: "Number of items",
//       value: "Priority Quote",
//       icon: null,
//     },
    
//   ];

//   return (
//     <div className="p-6">
//       <div>
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-2">
//             <Link
//               href="/upholstery"
//               className="mr-2 text-black flex items-center gap-2"
//             >
//               <FaArrowLeft className="inline mr-1" />
//               <span className="text-xl font-semibold">
//                 Pillow Order Details
//               </span>
//             </Link>
//           </div>
//           <div className="flex items-center gap-2">
//             <span className="font-medium text-gray-600">
//               Update Order Status
//             </span>
//             <OrderStatusDropdown status={status} onChange={setStatus} />
//           </div>
//         </div>
//       </div>

//       <div className="border-b mx-2">
//         <CustomerInfo
//           customer={order.customer}
//           onAssignVendor={() => setShowVendorModal(true)}
//         />
//       </div>

//       <div className="grid grid-cols-3 gap-8 p-4 w-2/3 font-poppins tracking-wide">
//         {orderDetails.map((item, idx) => (
//           <div key={idx}>
//             <div className="text-gray-500 ">{item.label}</div>
//             <div className="font- text-lg flex items-center gap-2 text-secondary py-3">
//               {/* {item.icon} */}
//               {item.value}
//             </div>
//           </div>
//         ))}
//       </div>
//       {/* Modal */}
//       {showVendorModal && (
//         <VendorModal onClose={() => setShowVendorModal(false)} />
//       )}
//     </div>
// }


"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import CustomerInfo from "@/components/customerInfo";
import VendorModal from "../../upholstery/[upholsteryId]/components/assignVendorModal";
import OrderStatusDropdown from "../../upholstery/[upholsteryId]/components/orderStatus";
import { IMAGES } from "@/constants/image";
import { getPillowOrderByNumber } from "@/lib/supabase";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Use RawPillowOrder type directly or create a simpler interface
interface Order {
  user_name?: string;
  user_email?: string;
  customer_phone?: string;
  address?: { address?: string };
  user_profileImage?: string;
  fabric_type?: { option_name?: string };
  upholstery_feature?: { feature_name?: string; description?: string };
  furniture_size?: { length?: number };
  is_priority?: boolean;
  order_status?: Array<{ status?: string }>;
  order_number?: string;
}

export default function Page() {
  const params = useParams();
  const orderId = Array.isArray(params?.orderId)
    ? params.orderId[0]
    : params?.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("");
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await getPillowOrderByNumber(orderId);
        
        if (data) {
          // Convert RawPillowOrder to Order type
          const orderData: Order = {
            user_name: data.user_name,
            user_email: data.user_email,
            address: typeof data.address === "string"
              ? { address: data.address }
              : data.address
                ? data.address
                : undefined,
            user_profileImage: data.user_profileImage,
            fabric_type: data.fabric_type,
            upholstery_feature: data.upholstery_feature,
            furniture_size: data.furniture_size,
            is_priority: data.is_priority,
            order_status: data.order_status,
            order_number: data.order_number
          };
          
          setOrder(orderData);
          setStatus(orderData.order_status?.[0]?.status || "Unknown");
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch order");
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner message="Loading order details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <Link href="/admin/orders" className="text-blue-500 underline mt-2 inline-block">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <p>Order not found</p>
          <Link href="/admin/orders" className="text-blue-500 underline mt-2 inline-block">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderDetails = [
    {
      label: order.fabric_type?.option_name || "N/A",
      value: "Pillow Type",
    },
    {
      label: order.upholstery_feature?.feature_name || "N/A",
      value: "Seating Type",
    },
    {
      label: order.upholstery_feature?.description || "N/A",
      value: "Fabric Features",
    },
    {
      label: `${order.furniture_size?.length || 0}L`,
      value: "Dimensions",
    },
    {
      label: order.is_priority ? "Yes" : "No",
      value: "Priority Quote",
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/orders" className="flex items-center gap-2 text-black">
          <FaArrowLeft />
          <span className="text-xl font-semibold">Pillow Order Details</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">Update Order Status</span>
          <OrderStatusDropdown status={status} onChange={setStatus} />
        </div>
      </div>

      {/* Customer Info */}
      <div className="border-b mx-2">
        <CustomerInfo
          customer={{
            name: order.user_name || "Unknown Customer",
            email: order.user_email || "No Email",
            address: order.address?.address || "No Address",
            avatar: order.user_profileImage || IMAGES.avatar,
          }}
          onAssignVendor={() => setShowVendorModal(true)}
        />
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-3 gap-8 p-4 w-2/3 font-poppins tracking-wide">
        {orderDetails.map((item, idx) => (
          <div key={idx}>
            <div className="text-gray-500">{item.value}</div>
            <div className="text-lg text-secondary py-3">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Vendor Modal */}
      {showVendorModal && <VendorModal onClose={() => setShowVendorModal(false)} />}
    </div>
  );
}

