"use client";

import { useState } from "react"; 
// components
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// icons
import { Trash2 } from "lucide-react";

export default function AccountSettingsPage() {
  const [email, setEmail] = useState("user@example.com");
  const [language, setLanguage] = useState("en");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Dummy handlers – replace these with your actual API calls.
  const handleEmailUpdate = () => {
    console.log("Updated email:", email);
  };

  const handlePasswordUpdate = () => {
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Password updated");
  };

  const handleAccountDelete = () => {
    console.log("Account deleted");
    setShowDeleteDialog(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="border rounded-lg shadow-lg">
          <CardHeader className="border-b p-6">
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Email Update Section */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg">Email</Label>
              <Input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button variant="default" onClick={handleEmailUpdate} className="mt-2">
                Update Email
              </Button>
            </div>
            {/* Preferred Language Section */}
            <div className="space-y-2">
              <Label htmlFor="language" className="text-lg">Preferred Language</Label>
              <Select value={language} onValueChange={(value) => setLanguage(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Password Update Section */}
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-lg">Change Password</Label>
              <Input 
                id="current-password"
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Input 
                id="new-password"
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Input 
                id="confirm-new-password"
                type="password"
                placeholder="Confirm New Password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button variant="default" onClick={handlePasswordUpdate} className="mt-2">
                Update Password
              </Button>
            </div>
          </CardContent>
          <CardFooter className="p-6 flex justify-end border-t">
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardFooter>
        </Card>
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogTrigger asChild>
            <div />
          </DialogTrigger>
          <DialogContent className="max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Confirm Account Deletion
              </DialogTitle>
            </DialogHeader>
            <div className="my-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
            </div>
            <DialogFooter className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleAccountDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
