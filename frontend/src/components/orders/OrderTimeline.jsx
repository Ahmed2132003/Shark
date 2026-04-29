const CHECKPOINTS = ['pending', 'processing', 'shipped', 'delivered'];

function statusIndex(status) {
  return CHECKPOINTS.indexOf(status);
}

export default function OrderTimeline({ status }) {
  const currentIndex = statusIndex(status);

  return (
    <div>
      <h3 className="orders-section-title">Fulfillment Timeline</h3>
      <div className="orders-timeline-grid">
        {CHECKPOINTS.map((checkpoint, index) => {
          const done = currentIndex >= index;
          const cancelled = status === 'cancelled';
          const stateClass = cancelled ? 'orders-timeline-step--cancelled' : done ? 'orders-timeline-step--done' : 'orders-timeline-step--waiting';

          return (
            <article key={checkpoint} className={`orders-timeline-step ${stateClass}`}>
              <p className="orders-timeline-step__title">{checkpoint}</p>
              <p className="orders-timeline-step__hint">{cancelled ? 'Order has been cancelled.' : done ? 'Completed' : 'Waiting'}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}