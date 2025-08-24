"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Loader2, Printer, Trash2, Plus, Import, Calculator, FileSpreadsheet, AlertCircle, DollarSign } from 'lucide-react';
import { useCostCalculator } from "@/hooks/calculator-config";
import { formatTND } from "@/hooks/currency";

interface CostCalculatorProps {
  eventId: string;
  budget?: number;
  eventName?: string;
}

export const CostCalculator = ({ 
  eventId, 
  budget = 10000, 
  eventName = "Wedding Event" 
}: CostCalculatorProps) => {
  const {
    items,
    loading,
    form,
    total,
    isAdding,
    isImporting,
    deletingItemId,
    fileInputRef,
    budgetPercentage,
    isFormValid,
    budgetStatus,
    setForm,
    handleAddItem,
    handleDeleteItem,
    handleDownloadTemplate,
    handleExportInvoice,
    handleImport,
    handleImportClick,
  } = useCostCalculator(eventId, budget);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Loading cost calculator...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Cost Calculator
          </h1>
          <p className="text-muted-foreground mt-1">
            Managing expenses for <span className="font-medium">{eventName}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Template
          </Button>
          <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
            {isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Import className="mr-2 h-4 w-4" />
            )}
            Import
          </Button>
          <Button variant="outline" onClick={handleExportInvoice}>
            <Printer className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Spent</Label>
              <div className="text-2xl font-bold">{formatTND(total?.total || 0)}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Budget</Label>
              <div className="text-2xl font-bold">{formatTND(budget)}</div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Remaining</Label>
              <div className={`text-2xl font-bold ${budgetStatus === 'over' ? 'text-red-600' : 'text-green-600'}`}>
                {formatTND(budget - (total?.total || 0))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Usage</span>
              <span>{budgetPercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={budgetPercentage} 
              className={`h-2 ${budgetStatus === 'over' ? '[&>div]:bg-red-500' : budgetStatus === 'warning' ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
            />
          </div>

          {budgetStatus === 'over' && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                You are over budget by {formatTND((total?.total || 0) - budget)}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Add Item Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="label">Item Description</Label>
              <Input
                id="label"
                placeholder="e.g., Venue rental, Catering..."
                value={form.label}
                onChange={(e) => setForm(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="price">Price (TND)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="1"
                value={form.quantity}
                onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              {isFormValid && (
                <span>
                  Total: {formatTND(parseFloat(form.price) * parseInt(form.quantity))}
                </span>
              )}
            </div>
            <Button onClick={handleAddItem} disabled={!isFormValid || isAdding}>
              {isAdding ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Item
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Cost Items
            </div>
            <Badge variant="secondary">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No items added yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first cost item or import from a CSV/XLSX file
              </p>
              <Button onClick={handleImportClick} variant="outline">
                <Import className="mr-2 h-4 w-4" />
                Import Items
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.label}</TableCell>
                        <TableCell className="text-right">{formatTND(item.price)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatTND(item.price * item.quantity)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deletingItemId === item.id}
                          >
                            {deletingItemId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Cost</span>
                <span className="text-2xl font-bold">{formatTND(total?.total || 0)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};