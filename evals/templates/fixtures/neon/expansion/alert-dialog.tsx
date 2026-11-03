// alert-dialog, measured open against CDS Alert (fixtures/expansion/alert-dialog.tsx):
// a destructive confirmation with a dismiss and a preferred action, as CDS's
// dismissActionLabel and preferredActionVariant="negative" draw them.
import { Button } from "@/components/ui/button"
import {
  AlertDialog as NeonAlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AlertDialog() {
  return (
    <div>
      <NeonAlertDialog>
        <AlertDialogTrigger asChild><Button variant="destructive">ลบบัญชี / Remove account</Button></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ลบบัญชีรับเงิน / Remove payout account</AlertDialogTitle>
            <AlertDialogDescription>บัญชีนี้จะถูกลบและไม่สามารถกู้คืนได้ / This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก / Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive">ลบ / Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </NeonAlertDialog>
    </div>
  )
}
