import { useMutation } from "@tanstack/react-query";
import { API_HOST } from "./consts";
import { useWallet } from "@vechain/vechain-kit";
import { useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

function uploadReceipt(image: string, address: string) {
  return fetch(`${API_HOST}/bigbottle/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ img_url: image, wallet_address: address }),
  });
}

export function useUploadReceipt() {
  const { connection, connectedWallet } = useWallet();
  const address = connectedWallet?.address;
  const toast = useToast();
  const router = useRouter();

  return useMutation({
    mutationFn: (image: string) => {
      if (!address || !connection.isConnected) {
        throw new Error("No address found or not connected");
      }

      return uploadReceipt(image, address);
    },
    onSuccess: () => {
      toast({
        title: "Receipt uploaded",
        description: "Your receipt has been uploaded",
        status: "success",
      });
      router.push("/");
    },
    onError: () => {
      toast({
        title: "Receipt upload failed",
        description: "Please try again",
        status: "error",
      });
    },
  });
}
