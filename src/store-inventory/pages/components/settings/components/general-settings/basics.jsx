'use client';

import { useState } from 'react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Command,
  CommandCheck,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input, InputAddon, InputGroup } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Country data for phone number input
const countries = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', dialCode: '+36', flag: '🇭🇺' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', dialCode: '+886', flag: '🇹🇼' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', dialCode: '+51', flag: '🇵🇪' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
];

// Phone Number Input Component
function PhoneNumberInput({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[8]); // Default to Netherlands

  // Handle phone number input change
  const handlePhoneChange = (inputValue) => {
    // Remove any non-digit characters except + at the start
    const cleanValue = inputValue.replace(/[^\d+]/g, '');

    // Check if user is typing a country code
    if (cleanValue.startsWith('+')) {
      const matchedCountry = countries.find((country) =>
        cleanValue.startsWith(country.dialCode),
      );

      if (matchedCountry && matchedCountry.code !== selectedCountry.code) {
        setSelectedCountry(matchedCountry);
        onChange(cleanValue.slice(matchedCountry.dialCode.length));
        return;
      }
    }

    onChange(cleanValue.startsWith('+') ? cleanValue : cleanValue);
  };

  // Handle country selection
  const handleCountrySelect = (countryCode) => {
    const country = countries.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center w-full">
      {/* Country Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-24 items-center justify-between rounded-e-none border-e-0 bg-transparent"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-sm leading-none">
                {selectedCountry.flag}
              </span>
              <span className="text-xs leading-none">
                {selectedCountry.dialCode}
              </span>
            </span>
            <svg
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <ScrollArea className="h-[300px]">
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.name} ${country.dialCode}`}
                      onSelect={() => handleCountrySelect(country.code)}
                    >
                      <span className="flex items-center gap-1.5 leading-none">
                        <span className="text-sm">{country.flag}</span>
                        <span className="text-sm text-foreground truncate">
                          {country.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {country.dialCode}
                        </span>
                      </span>
                      {selectedCountry.code === country.code && (
                        <CommandCheck />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Phone Number Input */}
      <Input
        type="tel"
        placeholder="+31"
        value={value.startsWith('+') ? value : value}
        onChange={(e) => handlePhoneChange(e.target.value)}
        className="rounded-l-none flex-1"
      />
    </div>
  );
}

export function Basics() {
  const [companyName, setCompanyName] = useState("Bob's Shoes Store|");
  const [selectedImage, setSelectedImage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  return (
    <Card className="bg-accent/70 rounded-md shadow-none h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        <h3 className="text-sm font-medium text-foreground py-2.5 ps-2">
          Basics
        </h3>
        <div className="bg-background rounded-md m-1 mt-0 border border-input p-5 space-y-5 h-full">
          {/* Company Name */}
          <div className="flex items-center gap-5">
            <div className="flex flex-col gap-0.5 basis-1/3">
              <Label className="text-2sm font-medium shrink-0">
                Company Name
              </Label>
              <span className="text-xs font-normal text-muted-foreground">
                Store logo or brand icon
              </span>
            </div>
            <Input
              placeholder="Bob’s Shoes Store|"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="basis-2/3"
            />
          </div>

          <Separator />

          {/* Profile Image */}
          <div className="flex items-center gap-5">
            <div className="flex flex-col gap-0.5 basis-1/3">
              <Label className="text-2sm font-medium shrink-0">
                Profile Image
              </Label>
              <span className="text-xs font-normal text-muted-foreground">
                Store logo or brand icon
              </span>
            </div>
            <div className="basis-2/3">
              <div className="flex items-center gap-2.5">
                <div className="w-[60px] h-[60px] border border-border/50 rounded-lg flex items-center justify-center">
                  <img
                    src={
                      selectedImage || toAbsoluteUrl('/media/avatars/300-1.png')
                    }
                    alt="Profile"
                    className="rounded-lg size-[60px] object-contain"
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-image-upload"
                />

                <label htmlFor="profile-image-upload" className="ml-2.5">
                  <Button size="sm" variant="outline" asChild>
                    <span>Upload</span>
                  </Button>
                </label>
                <Button variant="ghost" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* CompaStore URL */}
          <div className="flex items-center gap-5">
            <div className="flex flex-col gap-0.5 basis-1/3">
              <Label className="text-2sm font-medium shrink-0">Store URL</Label>
              <span className="text-xs font-normal text-muted-foreground">
                Link to your online store
              </span>
            </div>
            <InputGroup className="basis-2/3">
              <InputAddon>https://</InputAddon>
              <Input type="reui" placeholder="reui.io" />
            </InputGroup>
          </div>

          <Separator />

          {/* Store Phone */}
          <div className="flex items-center gap-5">
            <div className="flex flex-col gap-0.5 basis-1/3">
              <Label className="text-2sm font-medium shrink-0">
                Store Phone
              </Label>
              <span className="text-xs font-normal text-muted-foreground">
                Customer service phone number
              </span>
            </div>
            <div className="basis-2/3">
              <PhoneNumberInput value={phoneNumber} onChange={setPhoneNumber} />
            </div>
          </div>

          <Separator />

          {/* Contact Email */}
          <div className="flex items-center gap-5">
            <div className="flex flex-col gap-0.5 lg:basis-1/3">
              <Label className="text-2sm font-medium shrink-0">
                Contact Email
              </Label>
              <span className="text-xs font-normal text-muted-foreground">
                Email for customer inquiries
              </span>
            </div>
            <Input
              placeholder="Contact Email"
              className="basis-2/3"
              type="email"
            />
          </div>

          <Separator />

          {/* What do you do? */}
          <div className="flex items-center gap-5">
            <div className="flex flex-col gap-0.5 basis-1/3">
              <Label className="text-2sm font-medium shrink-0">
                What do you do?
              </Label>
              <span className="text-xs font-normal text-muted-foreground">
                Tags describing store products
              </span>
            </div>
            <Input
              placeholder="Start typing tags"
              className="basis-2/3"
              type="text"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
