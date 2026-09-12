import { Button, TextInput } from '../../components';

export const AddEditFuelingPage = () => (
  <form className="flex flex-col gap-4">
    <TextInput
      label="תאריך"
      type="date"
      numeric
      defaultValue={new Date().toISOString().slice(0, 10)}
    />
    <TextInput label="קריאת מד אוץ" numeric unit="ק״מ" placeholder="41,980" />
    <TextInput label="כמות דלק" numeric unit="ליטר" placeholder="28.0" />
    <TextInput label="סה״כ לתשלום" numeric unit="₪" placeholder="158.20" />
    <TextInput label="הערות" placeholder="אופציונלי" />

    <Button type="submit" fullWidth>
      שמור תדלוק
    </Button>
  </form>
);
