import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoModel } from '../../../../models/video.model';
import { VideoService } from '../../../../services/video/video.service';

declare var videojs: any;

@Component({
  selector: 'app-play-video',
  templateUrl: './play-video.component.html',
  styleUrls: ['./play-video.component.css']
})
export class PlayVideoComponent implements OnInit, AfterViewInit, OnDestroy {

  private videoId: number;
  private videoPlayer: any;
  public videoModel: VideoModel;
  public relatedVideos: VideoModel[] = [];
  @ViewChild('imgSlider', { read: ElementRef }) imgSlider: ElementRef;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _videoService: VideoService,
    private _router: Router) {



  }

  ngOnInit() {
    this._activatedRoute.params.subscribe(params => {
      let vid = params['id'];
      if (vid) {
        this.videoId = parseInt(vid);
        this._videoService.getVideoById(this.videoId).then(vdo => {
          this.videoModel = vdo;
          this.setVideoData(vdo.src, vdo.thumbnails.large);
          let randonCatId = this.videoModel.categories[Math.floor(Math.random() * this.videoModel.categories.length)].id;

          this._videoService.getRelatedVideos(this.videoModel.id, randonCatId).then(vdo => {
            this.relatedVideos = vdo;
          }).catch(err => alert(err));
        }).catch(err => {
          alert(err);
        });
      }
    })
  }

  ngAfterViewInit() {
    this.videoPlayer = videojs(document.getElementById('video-player'),
      {
        height: 450,
        controls: true,
        autoplay: true,
        preload: 'auto'
      })
  }

  ngOnDestroy() {
    this.saveVideoTime();
  }

  private setVideoData(src: string, poster?: string): Promise<string> {
    if (src && this.videoPlayer) {
      this.videoPlayer.src(src);
      this.videoPlayer.load();
      try {
        this.videoPlayer.play();
      }
      catch(err){
        console.log(err);
      }
      finally {
        if (poster) {
          this.videoPlayer.poster = poster;
        }

        return Promise.resolve('Src set');
      }



    }
    else {
      return Promise.reject('src not set');
    }
  }

  private saveVideoTime(): void {
    let totalTime = this.videoPlayer.currentTime();
    if (totalTime > 0) {
      this._videoService.setVideoTimeByVideoId(this.videoModel.id, totalTime).then(msg => console.log(msg)).catch(err => alert(err));
    }
  }

  public imgSlide(slideTo: string) {
    let slider: HTMLDivElement = this.imgSlider.nativeElement;
    let scrollLength: number = 0;
    if (slideTo == 'left') {
      scrollLength = slider.scrollLeft + slider.clientWidth;
      if (scrollLength >= slider.scrollWidth) {
        scrollLength = 0;
      }
    }
    else {
      scrollLength = slider.scrollLeft - slider.clientWidth;
      if (slider.scrollLeft <= 0) {
        scrollLength = slider.scrollWidth;
      }
    }
    slider.scroll({ left: scrollLength, behavior: 'smooth' });
  }

  public OnContextmenu(ev: MouseEvent): boolean {
    // ev.preventDefault();
    // ev.stopPropagation();
    return false;
  }

  public playVideo(ev: MouseEvent, videoId: string) {
    ev.preventDefault();
    ev.stopPropagation();
    this.saveVideoTime();
    this._router.navigate(['video/play', videoId]);
  }



}
