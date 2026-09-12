import { Button, Card, TextInput } from '../../components'

export const SettingsPage = () => (
  <div className="flex flex-col gap-6">
    <Card className="flex flex-col gap-4">
      <TextInput label="כינוי הרכב" defaultValue="האונדה שלי" />
      <TextInput label="יצרן ודגם" defaultValue="הונדה סיוויק" />
      <TextInput label="שנת ייצור" numeric defaultValue="2019" />
      <TextInput label="מספר רישוי" numeric defaultValue="12-345-67" />
    </Card>

    <Button variant="secondary" fullWidth>
      החלף רכב
    </Button>
    <Button variant="secondary" fullWidth>
      התנתקות
    </Button>
  </div>
)
