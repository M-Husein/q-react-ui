# Form

A reusable Form component that wraps its children inside a `<fieldset>` element.

This component is designed to simplify form handling by automatically applying the `disabled` state to the entire fieldset, and allowing additional customization via standard HTML form and fieldset attributes.

## Usage

```tsx
<Form
  disabled
  fielsetProps={{ className: 'fieldset-class' }} 
  onSubmit={handleSubmit}
>
  <Input name="email" />
  <Button type="submit">Submit</Button>
</Form>
```
