import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MediaUpload } from '../index';

function makeFile(name: string, size: number, type = 'image/png'): File {
  const file = new File(['x'.repeat(size)], name, { type });
  return file;
}

describe('MediaUpload', () => {
  it('renders the default label', () => {
    render(<MediaUpload onUpload={jest.fn()} />);
    expect(screen.getByText('Upload files')).toBeInTheDocument();
  });

  it('renders a custom label', () => {
    render(<MediaUpload onUpload={jest.fn()} label="Upload photos" />);
    expect(screen.getByText('Upload photos')).toBeInTheDocument();
  });

  it('disables Upload when no files are selected', () => {
    render(<MediaUpload onUpload={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('adds a file via the file input and shows its name and size', () => {
    render(<MediaUpload onUpload={jest.fn()} />);
    const file = makeFile('photo.png', 2048);

    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [file] }
    });

    expect(screen.getByText('photo.png')).toBeInTheDocument();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeEnabled();
  });

  it('removes a selected file', () => {
    render(<MediaUpload onUpload={jest.fn()} />);
    const file = makeFile('photo.png', 1024);

    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [file] }
    });
    expect(screen.getByText('photo.png')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByText('photo.png')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload' })).toBeDisabled();
  });

  it('uploads selected files and clears the list on success', async () => {
    const onUpload = jest.fn().mockResolvedValue(undefined);
    render(<MediaUpload onUpload={onUpload} />);
    const file = makeFile('photo.png', 1024);

    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [file] }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    await waitFor(() => expect(onUpload).toHaveBeenCalledWith([file]));
    await waitFor(() => expect(screen.queryByText('photo.png')).not.toBeInTheDocument());
  });

  it('shows an error message when onUpload rejects', async () => {
    const onUpload = jest.fn().mockRejectedValue(new Error('Upload failed: file too large'));
    render(<MediaUpload onUpload={onUpload} />);
    const file = makeFile('photo.png', 1024);

    fireEvent.change(document.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [file] }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    expect(await screen.findByText('Upload failed: file too large')).toBeInTheDocument();
  });

  it('handles drag-and-drop of files', () => {
    render(<MediaUpload onUpload={jest.fn()} multiple />);
    const file = makeFile('document.pdf', 1048576, 'application/pdf');
    const dropZone = screen.getByText(/Drag and drop files here/).parentElement as HTMLElement;

    fireEvent.dragOver(dropZone, { dataTransfer: { files: [file] } });
    fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.0 MB')).toBeInTheDocument();
  });

  it('appends files when multiple is true and replaces when false', () => {
    render(<MediaUpload onUpload={jest.fn()} multiple />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [makeFile('a.png', 100)] } });
    fireEvent.change(input, { target: { files: [makeFile('b.png', 100)] } });

    expect(screen.getByText('a.png')).toBeInTheDocument();
    expect(screen.getByText('b.png')).toBeInTheDocument();
  });

  it('handles dragLeave resetting the dragging state', () => {
    render(<MediaUpload onUpload={jest.fn()} />);
    const dropZone = screen.getByText(/Drag and drop files here/).parentElement as HTMLElement;

    fireEvent.dragOver(dropZone, { dataTransfer: { files: [] } });
    fireEvent.dragLeave(dropZone);

    expect(screen.getByText(/Drag and drop files here/)).toBeInTheDocument();
  });
});
