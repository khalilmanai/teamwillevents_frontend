import { formatTND } from "@/lib/utils"

interface InvoiceTemplateProps {
  invoiceNumber: number
  eventName: string
  items: {
    id: string
    label: string
    price: number
    quantity: number
  }[]
  total: {
    total: number
    budget?: number
    withinBudget: boolean
  } | null
}

export function InvoiceTemplate({ 
  invoiceNumber, 
  eventName, 
  items, 
  total 
}: InvoiceTemplateProps) {
  return (
    <div className="p-8 bg-white">
      {/* Invoice Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/teamwill-logo.png" 
              alt="Teamwill Logo" 
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
              <p className="text-muted-foreground">#{invoiceNumber}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Teamwill Events Management</p>
            <p>123 Business Avenue, Tunis, Tunisia</p>
            <p>contact@teamwill.com | +216 12 345 678</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold text-primary">{eventName}</h2>
          <div className="mt-2 text-sm text-muted-foreground">
            <p className="font-medium">Invoice Date:</p>
            <p>{new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4 text-primary border-b pb-2">
          Cost Breakdown
        </h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-primary/20">
              <th className="text-left py-3 font-medium text-primary">Item</th>
              <th className="text-right py-3 font-medium text-primary">Unit Price</th>
              <th className="text-center py-3 font-medium text-primary">Qty</th>
              <th className="text-right py-3 font-medium text-primary">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const rowTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0)
              return (
                <tr key={item.id} className="border-b border-muted-foreground/10">
                  <td className="py-3">{item.label}</td>
                  <td className="text-right py-3">{formatTND(Number(item.price) || 0)}</td>
                  <td className="text-center py-3">{item.quantity}</td>
                  <td className="text-right py-3 font-medium">{formatTND(rowTotal)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="flex justify-end">
        <div className="w-80 space-y-3">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span>{formatTND(total?.total || 0)}</span>
          </div>
          
          {total?.budget && (
            <div className="flex justify-between">
              <span className="font-medium">Budget:</span>
              <span>{formatTND(total.budget)}</span>
            </div>
          )}

          <div className="border-t border-primary/20 pt-2 flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary">{formatTND(total?.total || 0)}</span>
          </div>

          {total?.budget && (
            <div className={`text-right font-medium ${
              total?.withinBudget ? 'text-green-600' : 'text-red-600'
            }`}>
              {total?.withinBudget ? 'Within Budget' : 'Over Budget by'} 
              {!total?.withinBudget && ` ${formatTND(total.total - total.budget)}`}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-primary/20">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium text-primary mb-2">Payment Information</h4>
            <div className="text-sm text-muted-foreground">
              <p>Bank Name: BIAT</p>
              <p>Account Name: Teamwill Events</p>
              <p>RIB: 04 123 456 789123456789 12</p>
              <p>IBAN: TN59 0412 3456 7891 2345 6789</p>
            </div>
          </div>
          <div className="text-right">
            <div className="mb-4">
              <h4 className="font-medium text-primary mb-2">Thank You</h4>
              <p className="text-sm text-muted-foreground">
                We appreciate your business. Please contact us for any questions.
              </p>
            </div>
            <div className="mt-6">
              <div className="h-16 w-48 mx-auto border border-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground">
                Authorized Signature
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>This is an automatically generated invoice from Teamwill Events Management System</p>
          <p className="mt-1">Invoice generated on: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}