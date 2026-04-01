import styles from './UnderConstruction.module.css';
import Image from 'next/image';

export const UnderConstruction = () => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.loading}>
        Under Construction<span className={styles.dots}></span>
      </p>

      <Image
        src='/under-construction.png'
        alt='Under construction'
        width={400}
        height={300}
        className={styles.image}
      />
    </div>
  );
};
