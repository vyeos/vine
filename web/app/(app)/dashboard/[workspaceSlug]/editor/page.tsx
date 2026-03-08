import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function EditorPlaceholderPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;

  return (
    <div className='p-6'>
      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
          <CardDescription>The editor migration has not been finished yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant='outline'>
            <Link href={`/dashboard/${workspaceSlug}/posts`}>Back to posts</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
