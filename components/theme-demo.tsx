"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ThemeDemo() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground theme-transition p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">🎨 4-Theme System Demo</h1>
            <p className="text-muted-foreground">
              Switch between themes to see automatic component adaptation
            </p>
          </div>
          <ThemeSwitcher />
        </div>

        <Separator />

        {/* Theme Behavior Explanation */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Behavior</CardTitle>
            <CardDescription>
              Components automatically adapt their styling based on the current theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Filled Themes</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• <Badge variant="secondary">Light</Badge> - Bright filled backgrounds</p>
                  <p>• <Badge variant="secondary">Eco+ Light</Badge> - Nature-inspired filled</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Outline Themes</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• <Badge variant="outline">Dark</Badge> - Dark with outline style</p>
                  <p>• <Badge variant="outline">Eco+ Dark</Badge> - Minimal nature outline</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cards Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Cards</CardTitle>
              <CardDescription>
                Cards automatically switch between filled and outline styles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card variant="adaptive" className="p-4">
                <h4 className="font-semibold mb-2">Adaptive Card (Default)</h4>
                <p className="text-sm text-muted-foreground">
                  This card adapts automatically based on the current theme.
                </p>
              </Card>
              
              <Card variant="filled" className="p-4">
                <h4 className="font-semibold mb-2">Always Filled</h4>
                <p className="text-sm text-muted-foreground">
                  This card always uses filled styling.
                </p>
              </Card>
              
              <Card variant="outline" className="p-4">
                <h4 className="font-semibold mb-2">Always Outline</h4>
                <p className="text-sm text-muted-foreground">
                  This card always uses outline styling.
                </p>
              </Card>
            </CardContent>
          </Card>

          {/* Buttons Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Buttons</CardTitle>
              <CardDescription>
                Buttons adapt their default variant based on theme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setCount(count + 1)}>
                  Default ({count})
                </Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive" size="sm">Destructive</Button>
                <Button variant="filled" size="sm">Always Filled</Button>
                <Button variant="link" size="sm">Link</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dialog Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Dialog</CardTitle>
              <CardDescription>
                Dialogs adapt their background and border styles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Theme-Adaptive Dialog</DialogTitle>
                    <DialogDescription>
                      This dialog automatically adapts its styling based on the current theme.
                      Notice how it uses filled backgrounds in Light/Eco+ Light themes and 
                      outline styles in Dark/Eco+ Dark themes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm">
                      The dialog content, buttons, and overall appearance seamlessly 
                      match the selected theme's visual style.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">Primary Action</Button>
                      <Button variant="outline" size="sm">Secondary</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Popover Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Adaptive Popover</CardTitle>
              <CardDescription>
                Popovers adapt their background and styling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Theme-Adaptive Popover</h4>
                    <p className="text-sm text-muted-foreground">
                      This popover automatically adapts its background and border 
                      styling based on the current theme.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm">Action</Button>
                      <Button variant="ghost" size="sm">Cancel</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>
              Current theme's color variables in action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <div className="w-full h-12 bg-primary rounded border"></div>
                <p className="text-xs font-medium">Primary</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-secondary rounded border"></div>
                <p className="text-xs font-medium">Secondary</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-accent rounded border"></div>
                <p className="text-xs font-medium">Accent</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-muted rounded border"></div>
                <p className="text-xs font-medium">Muted</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-destructive rounded border"></div>
                <p className="text-xs font-medium">Destructive</p>
              </div>
              <div className="space-y-2">
                <div className="w-full h-12 bg-card rounded border"></div>
                <p className="text-xs font-medium">Card</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-muted-foreground text-sm">
          <p>🎨 Switch themes using the dropdown above to see all components adapt automatically</p>
        </div>
      </div>
    </div>
  );
}