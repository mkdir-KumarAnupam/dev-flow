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
import TunnelQRCodeModal from './modals/TunnelQRCodeModal';
import SecurityManagerModal from './modals/SecurityManagerModal';
import SettingsModal from './modals/SettingsModal';
import NoteReaderModal from './modals/NoteReaderModal';
import FocusedNoteModal from './modals/FocusedNoteModal';

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
      <TunnelQRCodeModal />
      <SecurityManagerModal />
      <SettingsModal />
      <NoteReaderModal />
      <FocusedNoteModal />
    </>
  );
}
