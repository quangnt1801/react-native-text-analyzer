interface TextComponentProps {
  input: string;
  type?: string;
}

export function TextComponent({ input, type }: TextComponentProps) {
  console.log('Đang xử lý:', input, 'Kiểu:', type);

  return {
    name: 'Quang',
    product: 'Ao thun',
  };
}
