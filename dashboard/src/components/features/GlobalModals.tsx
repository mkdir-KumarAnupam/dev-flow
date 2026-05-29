import RemoteDashboardModal from './modals/RemoteDashboardModal';
import AllWorkspacesModal from './modals/AllWorkspacesModal';
import CodeSearchModal from './modals/CodeSearchModal';
import SketchUpdateModal from './modals/SketchUpdateModal';
import ScreenshotPreviewModal from './modals/ScreenshotPreviewModal';
import DevFocusSessionsModal from './modals/DevFocusSessionsModal';
import GitStatusModal from './modals/GitStatusModal';
import DrilldownModal from './modals/DrilldownModal';
import IssueDetailsModal from './modals/IssueDetailsModal';
import DeploymentsModal from './modals/DeploymentsModal';

export default function GlobalModals() {
  return (
    <>
      <RemoteDashboardModal />
      <AllWorkspacesModal />
      <CodeSearchModal />
      <SketchUpdateModal />
      <ScreenshotPreviewModal />
      <DevFocusSessionsModal />
      <GitStatusModal />
      <DrilldownModal />
      <IssueDetailsModal />
      <DeploymentsModal />
    </>
  );
}
