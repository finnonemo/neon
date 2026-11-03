// alert-dialog's Counterpart, CDS Alert: a 318px card over the modal overlay
// at every width, a centered title3 title and muted body, and the dismiss and
// preferred actions side by side, each half the row.
import { useState } from "react";
import { Button } from "@coinbase/cds-web/buttons";
import { Alert } from "@coinbase/cds-web/overlays";

export default function AlertDialog() {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <Button variant="negative" onClick={() => setVisible(true)}>ลบบัญชี / Remove account</Button>
      <Alert
        visible={visible}
        onRequestClose={() => setVisible(false)}
        title="ลบบัญชีรับเงิน / Remove payout account"
        body="บัญชีนี้จะถูกลบและไม่สามารถกู้คืนได้ / This can't be undone."
        preferredActionLabel="ลบ / Remove"
        preferredActionVariant="negative"
        dismissActionLabel="ยกเลิก / Cancel"
      />
    </div>
  );
}
