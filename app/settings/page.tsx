"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function SettingsPage() {
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="max-w-7xl px-4 py-6 sm:px-5 sm:py-7 lg:px-6 lg:py-8 lg:ml-60">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-sm font-semibold text-[var(--foreground)]">Sarah Mitchell</span>
          <div
            onClick={handleClick}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-xs sm:text-sm cursor-pointer hover:ring-2 hover:ring-[var(--primary)] transition-all overflow-hidden"
            title="Click to upload profile photo"
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              "SM"
            )}
          </div>
        </div>
      </div>

      <Card className="mb-4 sm:mb-6">
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent className="!py-4 sm:!py-5">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-24 h-24 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold text-2xl overflow-hidden">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                "SM"
              )}
            </div>
            <div>
              <button
                onClick={handleClick}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors text-sm font-medium"
              >
                Upload Photo
              </button>
              <p className="text-xs text-[var(--text-secondary)] mt-2">JPG, PNG, or GIF. Max size 5MB.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="!py-4 sm:!py-5">
            <div className="space-y-3 sm:space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
              />
              <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors text-sm font-medium">
                Update Password
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
          </CardHeader>
          <CardContent className="!py-4 sm:!py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 max-w-md">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">2FA is disabled</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors text-sm font-medium">
                Enable 2FA
              </button>
            </div>
          </CardContent>
        </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />
    </main>
  );
}