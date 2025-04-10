import { toast } from "@/components/ui/use-toast";

// Helper function to show success toast
export const showSuccessToast = (title: string, description?: string) => {
	toast({
		title,
		description,
		variant: "default",
	});
};

// Helper function to show error toast
export const showErrorToast = (title: string, description?: string) => {
	toast({
		title,
		description,
		variant: "destructive",
	});
};

// Helper function to show info toast
export const showInfoToast = (title: string, description?: string) => {
	toast({
		title,
		description,
	});
};
