import { useParams, useNavigate } from 'react-router-dom';
import type { MouseEvent, FocusEvent, KeyboardEvent } from 'react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '~/components/ui';
import { useConversations, useLocalize, useNewConvo } from '~/hooks';
import { useArchiveConversationMutation } from '~/data-provider';
import { NotificationSeverity } from '~/common';
import { useToastContext } from '~/Providers';
import { ArchiveIcon } from '~/components/svg';

type ArchiveButtonProps = {
  conversationId: string;
  retainView: () => void;
  shouldArchive: boolean;
  appendLabel?: boolean;
  className?: string;
};

export default function ArchiveButton({
  conversationId,
  retainView,
  shouldArchive,
  appendLabel = false,
  className = '',
}: ArchiveButtonProps) {
  const localize = useLocalize();
  const navigate = useNavigate();
  const { showToast } = useToastContext();
  const { newConversation } = useNewConvo();
  const { refreshConversations } = useConversations();
  const { conversationId: currentConvoId } = useParams();

  const archiveConvoMutation = useArchiveConversationMutation(conversationId);

  const label = shouldArchive ? 'archive' : 'unarchive';
  const archiveHandler = (
    e:
      | MouseEvent<HTMLButtonElement>
      | FocusEvent<HTMLInputElement>
      | KeyboardEvent<HTMLInputElement>,
  ) => {
    e.preventDefault();
    archiveConvoMutation.mutate(
      { conversationId, isArchived: shouldArchive },
      {
        onSuccess: () => {
          if (currentConvoId === conversationId || currentConvoId === 'new') {
            newConversation();
            navigate('/c/new', { replace: true });
          }
          refreshConversations();
          retainView();
        },
        onError: () => {
          showToast({
            message: localize(`com_ui_${label}_error`),
            severity: NotificationSeverity.ERROR,
            showIcon: true,
          });
        },
      },
    );
  };

  return (
    <button type="button" className={className} onClick={archiveHandler}>
      <TooltipProvider delayDuration={250}>
        <Tooltip>
          <TooltipTrigger asChild>
            <>
              {appendLabel ? (
                <ArchiveIcon />
              ) : (
                <span className="h-5 w-5">
                  <ArchiveIcon className="hover:text-gray-400" />
                </span>
              )}
              {appendLabel && localize(`com_ui_${label}`)}
            </>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={0}>
            {localize(`com_ui_${label}`)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </button>
  );
}
